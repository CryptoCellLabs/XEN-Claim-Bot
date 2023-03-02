<script
    lang="ts"
    setup
>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  dateFormatter,
  getBlockExplorerAddressLink,
  getChainNativeTokenSymbol,
  hexStringToNumberString,
  shortWalletAddressFormatter,
  truncateNumberStringDecimal
} from '@/utils/formatter'
import { isValidWalletAddress } from '@/utils/formTools'
import { clearAddressStorage, getAddressStorage, setAddressStorage } from '@/utils/addressStorage'
import { sleep, waitTo } from '@/utils/promise'
import { utils, BigNumber } from 'ethers'
import type { TransactionResponse } from '@ethersproject/abstract-provider'
import { confirmTxWait, getRPCProvider, getWallet, getXENContract } from '@/contracts'
import CopyText from '@/components/CopyText.vue'

// Use functions
const router = useRouter()
const {t} = useI18n()

// Contracts
const chain = import.meta.env.VITE_APP_CHAIN
const provider = getRPCProvider(chain)
const chainTokenSymbol = getChainNativeTokenSymbol(chain)

// Gas
const getGasFeeInterval = ref<ReturnType<typeof setInterval> | null>(null)
const getGasFeeIntervalDuration = 5000
const gasFee = reactive<{
  loading: boolean;
  gas: BigNumber;
  gasPrice: BigNumber;
  maxPriorityFeePerGas: BigNumber;
  gwei: string;
  updateTime: number | null;
}>({
  loading: false,
  gas: BigNumber.from(0),
  gasPrice: BigNumber.from(0),
  maxPriorityFeePerGas: BigNumber.from(0),
  gwei: '',
  updateTime: null
})
const gweiColor = computed(() => {
  const gwei = gasFee.gwei ? Number(gasFee.gwei) : null
  if (!gwei) {
    return '#ffffff'
  } else if (gwei <= 12) {
    return '#2AFA7D'
  } else if (gwei <= 24) {
    return '#61a5fb'
  } else if (gwei <= 36) {
    return '#FDD05F'
  } else if (gwei <= 48) {
    return '#fa8c4d'
  } else {
    return '#FF6A5F'
  }
})

// Config Form
const storedMainWalletConfigKey = 'MAIN_WALLET_CONFIG'
const storedGweiConfigKey = 'GWEI_CONFIG'
const storedMainWalletConfigValue = window.localStorage.getItem(storedMainWalletConfigKey)
const storedGweiConfigValue = window.localStorage.getItem(storedGweiConfigKey)

const configForm = reactive<{
  mainWallet: string;
  gwei: string;
}>({
  mainWallet: storedMainWalletConfigValue || '',
  gwei: storedGweiConfigValue ? storedGweiConfigValue : '20'
})
const confirFormRules = {
  mainWallet: [
    (val: string) => {
      if (!val) {
        return t('configForm.pleaseInput')
      } else if (val && !isValidWalletAddress(val)) {
        return t('configForm.walletAddressFormatError')
      } else {
        return true
      }
    }
  ],
  gwei: [
    (val: string) => {
      if (!val) {
        return t('configForm.pleaseInput')
      } else {
        return true
      }
    }
  ]
}

// Address
const storedAddresses = getAddressStorage()
const addressList = ref<ClaimTableAddressItem[]>(storedAddresses || [])

// Task
const getTaskStatus = (): TaskStatus => {
  if (addressList.value.every(item => item.claimStatus === 'FINISHED' && item.transferStatus === 'FINISHED')) {
    return 'FINISHED'
  } else if (addressList.value.some(item => item.claimStatus !== 'INIT')) {
    return 'PAUSED'
  }
  return 'INIT'
}
const taskStatus = ref<TaskStatus>(getTaskStatus())
const taskCanStart = computed(() => {
  return configForm.mainWallet &&
      configForm.gwei &&
      isValidWalletAddress(configForm.mainWallet) &&
      !isNaN(Number(configForm.gwei))
})

// Logs
const logs = ref('')
const executeErrorAlertText = ref('')

const updateConfigFormMainWallet = (val: string) => {
  if (!val || (val && !isValidWalletAddress(val))) {
    return
  }
  window.localStorage.setItem(storedMainWalletConfigKey, val)
}

const updateConfigFormGwei = (val: string) => {
  if (!val || (val && isNaN(Number(val)))) {
    configForm.gwei = '1'
  }
  window.localStorage.setItem(storedGweiConfigKey, val)
}

const handleLogsAndError = (text: string, isError: boolean = false, item?: ClaimTableAddressItem, index?: number) => {
  if (isError) {
    executeErrorAlertText.value = text
    taskStatus.value = 'PAUSED'
  }
  const now = dateFormatter(Date.now(), 'yyyy-MM-dd hh:mm:ss:ms')
  logs.value = `${now}: ${typeof index === 'number' && item ? `${t('executingAddressItem', {
    val: index + 1,
    address: item.address
  })}` : ''} ${text}\n\r${logs.value}`
}

const startTask = () => {
  if (taskStatus.value === 'PROCESSING') {
    return
  }
  const logsText = taskStatus.value === 'PAUSED' ? t('taskContinue') : t('taskStarted')
  taskStatus.value = 'PROCESSING'
  executeErrorAlertText.value = ''
  handleLogsAndError(logsText)
  executeTask()
}

const executeTask = async (startIndex: number = 0) => {
  for (let i = startIndex; i < addressList.value.length; i++) {
    const item = addressList.value[i]

    // If this item has finished claim and transfer, skip it
    if (item.claimStatus === 'FINISHED' && item.transferStatus === 'FINISHED') {
      continue
    }

    // If this item has processing event, sleep a while then restart execute
    if (item.claimStatus === 'PROCESSING' || item.transferStatus === 'PROCESSING') {
      await sleep(10000)
      executeTask(i)
      break
    }

    // Check account balance before claim
    if (taskStatus.value !== 'PROCESSING') {
      break
    }
    await checkAccountBalance(item, i)

    // Check current gwei before claim
    if (taskStatus.value !== 'PROCESSING') {
      break
    }
    const claimGweiValid = await checkGasFeeValid()
    if (!claimGweiValid && taskStatus.value !== 'PROCESSING') {
      break
    }

    const wallet = getWallet(chain, item.privateKey, provider)

    // Claim XEN
    if (['INIT', 'FAILED'].includes(item.claimStatus)) {
      if (taskStatus.value !== 'PROCESSING') {
        break
      }
      item.claimStatus = 'PROCESSING'
      handleLogsAndError(`${t('claimXENProcessing')}`, false, item, i)
      const contract = getXENContract(chain, item.privateKey, provider, wallet)

      // Estimate gas used, if the account balance is not enough, will throw a error
      handleLogsAndError(`${t('estimatingGasProcessing')}`, false, item, i)
      const [estimateGasError, gasLimit] = await waitTo(
          contract.estimateGas.claimMintRewardAndShare(
              configForm.mainWallet,
              100,
              {
                maxFeePerGas: gasFee.gas,
                maxPriorityFeePerGas: gasFee.maxPriorityFeePerGas
              }
          )
      )
      if (estimateGasError) {
        handleTransactionFailed(item, 'claimStatus')
        handleLogsAndError(`${t('estimatingGasError')}${estimateGasError.message}`, true, item, i)
        break
      }

      // Claim XEN and share
      handleLogsAndError(`${t('claimAndShareProcessing')}`, false, item, i)
      const [claimTransactionError, claimTransaction] = await waitTo(
          contract.claimMintRewardAndShare(
              configForm.mainWallet,
              100,
              {
                gasLimit,
                maxFeePerGas: gasFee.gas,
                maxPriorityFeePerGas: gasFee.maxPriorityFeePerGas
              }
          )
      )
      if (claimTransactionError) {
        handleTransactionFailed(item, 'claimStatus')
        handleLogsAndError(`${t('claimAndShareError')}${claimTransactionError.message}`, true, item, i)
        break
      }

      // Confirm on-chain status
      handleLogsAndError(`${t('claimAndShareSend')}`, false, item, i)
      const [claimConfirmError, claimReceipt] = await waitTo(confirmTxWait(claimTransaction as TransactionResponse))
      if (claimConfirmError) {
        handleTransactionFailed(item, 'claimStatus')
        handleLogsAndError(`${t('claimAndShareSendError')}${claimConfirmError.message}`, true, item, i)
        break
      }
      item.claimTransaction = claimReceipt.transactionHash
      item.claimStatus = 'FINISHED'
      updateAddressStorage()
      handleLogsAndError(`${t('claimAndShareFinished')}`, false, item, i)
    }

    // Check account balance after claim
    if (taskStatus.value !== 'PROCESSING') {
      break
    }
    await checkAccountBalance(item, i)

    // Check current gwei before transfer
    if (taskStatus.value !== 'PROCESSING') {
      break
    }
    const transferGweiValid = await checkGasFeeValid()
    if (!transferGweiValid && taskStatus.value !== 'PROCESSING') {
      break
    }

    // Transfer balance to next account or main wallet
    if (['INIT', 'FAILED'].includes(item.transferStatus)) {
      if (taskStatus.value !== 'PROCESSING') {
        break
      }
      item.transferStatus = 'PROCESSING'
      handleLogsAndError(`${t('transferProcessing')}`, false, item, i)
      const maxGas = gasFee.gas as BigNumber
      // const maxFeePerGas = maxGas.mul(102).div(100) // Amplification factor 1.02
      const gasLimit = BigNumber.from(21000)
      const sendTokenGasFee = maxGas.mul(gasLimit)
      const remainAmount = BigNumber.from(item.balance).sub(sendTokenGasFee)
      const canSendAmount = truncateNumberStringDecimal(utils.formatEther(remainAmount), 8)
      const nextAddress = i === addressList.value.length - 1 ? configForm.mainWallet : addressList.value[i + 1].address

      const [transferTransactionError, transferTransaction] = await waitTo(
          wallet.sendTransaction({
            from: item.address,
            to: nextAddress,
            value: utils.parseEther(canSendAmount),
            nonce: provider.getTransactionCount(item.address, 'latest'),
            gasLimit,
            maxFeePerGas: gasFee.gas,
            maxPriorityFeePerGas: gasFee.maxPriorityFeePerGas
          })
      )
      if (transferTransactionError) {
        handleTransactionFailed(item, 'transferStatus')
        handleLogsAndError(`${t('sendTransferError')}${transferTransactionError.message}`, true, item, i)
        break
      }

      // Confirm transfer transaction
      handleLogsAndError(`${t('sentTransfer')}`, false, item, i)
      const [transactionConfirmError, transactionReceipt] = await waitTo(confirmTxWait(transferTransaction as TransactionResponse))
      if (transactionConfirmError) {
        handleTransactionFailed(item, 'transferStatus')
        handleLogsAndError(`${t('confirmTransferError')}${transactionConfirmError.message}`, true, item, i)
        break
      }
      item.transferTransaction = transactionReceipt.transactionHash
      item.transferStatus = 'FINISHED'
      updateAddressStorage()
      handleLogsAndError(`${t('confirmTransferFinished')}`, false, item, i)
    }

    // Check account balance after transfer
    await checkAccountBalance(item, i)

    // If this item is the last one, set task status to finished
    if (i === addressList.value.length - 1) {
      taskStatus.value = 'FINISHED'
    }
  }
}

const handleTransactionFailed = (item: ClaimTableAddressItem, type: 'claimStatus' | 'transferStatus') => {
  item[type] = 'FAILED'
  taskStatus.value = 'PAUSED'
  updateAddressStorage()
}

const pauseTask = () => {
  taskStatus.value = 'PAUSED'
  handleLogsAndError(t('taskPaused'))
}

const startNewTask = () => {
  clearAddressList()
}

const updateAddressStorage = () => {
  if (addressList.value.length) {
    setAddressStorage(addressList.value)
  } else {
    clearAddressStorage()
    router.push({
      name: 'ImportFile'
    })
  }
}

const clearAddressList = () => {
  addressList.value.length = 0
  updateAddressStorage()
}

const delAddressItem = (item: ClaimTableAddressItem, index: number) => {
  addressList.value.splice(index, 1)
  updateAddressStorage()
}

const getGasFee = async () => {
  if (gasFee.loading) {
    return
  }
  try {
    gasFee.loading = true
    const res = await provider.getFeeData()
    if (res && res.gasPrice && res.maxPriorityFeePerGas) {
      const gas = res.maxPriorityFeePerGas ? res.gasPrice.add(res.maxPriorityFeePerGas) : res.gasPrice
      const gwei = utils.formatUnits(gas, 'gwei')
      Object.assign(gasFee, {
        loading: false,
        gas,
        gasPrice: res.gasPrice,
        maxPriorityFeePerGas: res.maxPriorityFeePerGas,
        gwei: Number(gwei).toFixed(0),
        updateTime: Date.now()
      })
    }
    gasFee.loading = false
  } catch (e) {
    gasFee.loading = false
    throw e
  }
}

const checkGasFeeValid = async (): Promise<Function | boolean> => {
  if (taskStatus.value !== 'PROCESSING') {
    return false
  }
  handleLogsAndError(t('isCheckingGwei'))

  // If gasFee is fetching, wait a while and try again
  if (gasFee.loading) {
    await sleep(2000)
    return await checkGasFeeValid()
  }

  // If the last result is more than 1 second from now
  if (gasFee.updateTime && gasFee.updateTime + 1000 <= Date.now()) {
    try {
      await getGasFee()
    } catch (e) {
      // If failed to fetch data, wait a while, then try again
      await sleep(2000)
      return await checkGasFeeValid()
    }
  }

  // Check the gas fee is valid or not
  if (Number(gasFee.gwei) > Number(configForm.gwei)) {
    handleLogsAndError(t('gweiOverMax'))
    await sleep(5000)
    return await checkGasFeeValid()
  } else {
    handleLogsAndError(t('gweiValid'))
    return true
  }
}

const getAccountBalance = async (item: ClaimTableAddressItem, index: number) => {
  if (item.balanceLoading) {
    return
  }
  try {
    item.balanceLoading = true
    handleLogsAndError(t('isCheckingBalance'), false, item, index)
    const balance = await provider.getBalance(item.address)
    item.balance = utils.hexlify(balance)
    handleLogsAndError(t('balanceIs', {val: `${hexStringToNumberString(item.balance, 8)} ${chainTokenSymbol}`}), false, item, index)
    item.balanceLoading = false
    updateAddressStorage()
  } catch (e) {
    item.balanceLoading = false
    updateAddressStorage()
    const err = e as Error
    handleLogsAndError(`${t('getBalanceError')} ${err.message}`, false, item, index)
    throw e
  }
}

const checkAccountBalance = async (item: ClaimTableAddressItem, index: number): Promise<Function | void> => {
  if (taskStatus.value !== 'PROCESSING') {
    return
  }

  // If account balance is fetching, wait a while and try again
  if (item.balanceLoading) {
    await sleep(3000)
    return await checkAccountBalance(item, index)
  }

  try {
    await getAccountBalance(item, index)
  } catch (e) {
    // If failed to fetch balance, wait a while, then try again
    await sleep(3000)
    return await checkAccountBalance(item, index)
  }
}

onMounted(() => {
  getGasFee()
  getGasFeeInterval.value = setInterval(() => {
    getGasFee()
  }, getGasFeeIntervalDuration)
})

onBeforeUnmount(() => {
  if (getGasFeeInterval.value) {
    clearInterval(getGasFeeInterval.value)
  }
})
</script>

<template>
  <div class="claim-xen">
    <VCard class="mb-5">
      <VCardTitle class="bg-deep-purple pa-4 d-flex justify-space-between align-center">
        <span>{{ t('paramsConfig') }}</span>
        <div class="d-flex align-center">
          <VIcon
              :color="gweiColor"
              icon="mdi-gas-station"
              size="32"
          />
          <span
              class="ml-4"
              :style="{'color': gweiColor}"
          >{{ gasFee.gwei || '--' }} Gwei</span>
        </div>
      </VCardTitle>
      <VCardText class="px-4 py-6">
        <VForm class="mb-2">
          <VRow>
            <VCol cols="6">
              <VTextField
                  v-model="configForm.mainWallet"
                  :label="t('walletAddressToReceiveXEN')"
                  :rules="confirFormRules.mainWallet"
                  :disabled="taskStatus === 'PROCESSING'"
                  @update:model-value="updateConfigFormMainWallet"
              />
            </VCol>
            <VCol cols="2">
              <VTextField
                  v-model="configForm.gwei"
                  type="number"
                  :label="t('maxGwei')"
                  :rules="confirFormRules.gwei"
                  @update:model-value="updateConfigFormGwei"
              />
            </VCol>
          </VRow>
        </VForm>
        <div class="mb-5 text-grey">
          <p class="mb-1">{{ t('claimTips.title') }}:</p>
          <ol class="px-4">
            <li>{{ t('claimTips.p1') }}</li>
            <li>{{ t('claimTips.p2') }}</li>
            <li>{{ t('claimTips.p3') }}</li>
            <li>{{ t('claimTips.p4') }}</li>
            <li>{{ t('claimTips.p5') }}</li>
          </ol>
        </div>
        <div class="text-center">
          <VBtn
              v-if="taskStatus === 'INIT'"
              color="deep-purple"
              class="px-10"
              :disabled="!taskCanStart"
              @click="startTask"
          >
            {{ t('start') }}
          </VBtn>
          <VBtn
              v-if="taskStatus === 'PAUSED'"
              color="deep-purple"
              class="px-10"
              :disabled="!taskCanStart"
              @click="startTask"
          >
            {{ t('continue') }}
          </VBtn>
          <VBtn
              v-if="taskStatus === 'PROCESSING'"
              class="px-10"
              variant="tonal"
              @click="pauseTask"
          >
            {{ t('pause') }}
          </VBtn>
          <template v-if="taskStatus === 'FINISHED'">
            <VBtn
                class="px-10 mx-2"
                variant="tonal"
                disabled
            >
              {{ t('ended') }}
            </VBtn>
            <VBtn
                v-if="taskStatus === 'FINISHED'"
                class="px-10 mx-2"
                color="deep-purple"
                @click="startNewTask"
            >
              {{ t('startNewTask') }}
            </VBtn>
          </template>
        </div>
      </VCardText>
    </VCard>
    <VCard class="mb-5">
      <VCardTitle class="pa-4">
        {{ t('logs') }}
      </VCardTitle>
      <VCardText>
        <VAlert
            v-if="executeErrorAlertText"
            :text="executeErrorAlertText"
            type="error"
            class="mb-5"
        />
        <div
            class="border-sm pa-4 overflow-auto"
            style="max-height: 150px; white-space: pre-line;"
        >
          {{ logs || t('logsType.noContent') }}
        </div>
      </VCardText>
    </VCard>
    <VCard>
      <VCardTitle class="pa-4 d-flex justify-space-between">
        <div>
          <span>{{ t('totalAddresses') }}: {{ addressList.length }}</span>
        </div>
        <VBtn
            :disabled="taskStatus === 'PROCESSING'"
            variant="outlined"
            @click="clearAddressList"
        >
          {{ t('clearAddresses') }}
        </VBtn>
      </VCardTitle>
      <VCardText>
        <VTable>
          <thead>
          <tr>
            <th>#</th>
            <th>{{ t('walletAddress') }}</th>
            <th>{{ t('maturity') }}</th>
            <th>{{ t('term') }}</th>
            <th>{{ t('balance') }}</th>
            <th>{{ t('claimStatus') }}</th>
            <th>{{ t('transferStatus') }}</th>
            <th class="text-center">{{ t('actions') }}</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(item, index) in addressList"
              :key="index"
          >
            <td>{{ index + 1 }}</td>
            <td>
              <a
                  :href="getBlockExplorerAddressLink(item.address, chain)"
                  target="_blank"
                  class="text-deep-purple-accent-1"
              >
                {{ item.address }}
              </a>
              <CopyText :text="item.address" />
            </td>
            <td>{{ item.maturityTs ? dateFormatter(item.maturityTs) : '--' }}</td>
            <td>{{ item.term || '--' }}</td>
            <td>
              <VProgressCircular
                  v-if="item.balanceLoading"
                  indeterminate
                  size="small"
              />
              <template v-else>
                <span>{{ item.balance ? hexStringToNumberString(item.balance, 8) : '--' }} {{ chainTokenSymbol }}</span>
                <VBtn
                    variant="text"
                    icon
                    size="small"
                    @click="getAccountBalance(item, index)"
                >
                  <VIcon
                      icon="mdi-refresh"
                      size="large"
                  />
                </VBtn>
              </template>
            </td>
            <td>
              <VProgressCircular
                  v-if="item.claimStatus === 'PROCESSING'"
                  indeterminate
                  size="small"
              />
              <VIcon
                  v-else-if="item.claimStatus === 'FAILED'"
                  icon="mdi-alert-circle"
                  color="error"
              />
              <a
                  v-else-if="item.claimStatus === 'FINISHED' && item.claimTransaction"
                  :href="getBlockExplorerAddressLink(item.claimTransaction, chain, 'tx')"
                  target="_blank"
                  class="text-deep-purple-accent-1"
              >
                {{ shortWalletAddressFormatter(item.claimTransaction) }}
              </a>
              <span v-else>--</span>
            </td>
            <td>
              <VProgressCircular
                  v-if="item.transferStatus === 'PROCESSING'"
                  indeterminate
                  size="small"
              />
              <VIcon
                  v-else-if="item.transferStatus === 'FAILED'"
                  icon="mdi-alert-circle"
                  color="error"
              />
              <a
                  v-else-if="item.transferStatus === 'FINISHED' && item.transferTransaction"
                  :href="getBlockExplorerAddressLink(item.transferTransaction, chain, 'tx')"
                  target="_blank"
                  class="text-deep-purple-accent-1"
              >
                {{ shortWalletAddressFormatter(item.transferTransaction) }}
              </a>
              <span v-else>--</span>
            </td>
            <td class="text-center">
              <VBtn
                  variant="text"
                  color="error"
                  icon="mdi-delete-outline"
                  :disabled="taskStatus === 'PROCESSING'"
                  @click="delAddressItem(item, index)"
              />
            </td>
          </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>
  </div>
</template>
