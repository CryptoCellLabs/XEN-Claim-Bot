<script
    lang="ts"
    setup
>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { read as XLSXRead, utils as XLSXUtils } from 'xlsx'
import { getRPCProvider, getXENContract } from '@/contracts'
import { getFileExtension, isValidWalletAddress, isValidWalletPrivateKey } from '@/utils/formTools'
import { dateFormatter, getBlockExplorerAddressLink, getDateTimeDiffFromNow } from '@/utils/formatter'
import { setAddressStorage } from '@/utils/addressStorage'

// Use Functions
const router = useRouter()
const {t} = useI18n()

// Contracts
const chain = import.meta.env.VITE_APP_CHAIN
const provider = getRPCProvider(chain)

// Time
const currentTime = ref(Date.now())
const currentTimeInterval = ref<ReturnType<typeof setInterval> | null>(null)

// Import File Form
const isFormValid = ref(false)
const formRules = {
  importedFile: [
    (files: File[]) => {
      if (!files || !files.length) {
        return t('importFileForm.notFound')
      } else if (files && files.length && !checkImportedFileTypeIsValid(files[0])) {
        return t('importFileForm.notSupported')
      } else {
        return true
      }
    }
  ]
}
const importedFile = ref([])
const importedFileSupportedFileTypes = ['csv', 'xls', 'xlsx']
const importedFileAccepts = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].join()
const isLoadingImportedFile = ref(false)
const importErrorAlertText = ref('')

// Addresses
const addressList = ref<TableAddressItem[]>([])
const claimableAddressList = computed(() => {
  return addressList.value.filter(item => {
    if (!item.maturityTs) {
      return false
    }
    return currentTime.value >= item.maturityTs
  })
})
const claimButtonAvailable = computed(() => {
  return !isLoadingImportedFile.value && !!claimableAddressList.value.length
})

const updateImportedFile = (files: File[]) => {
  setTimeout(() => {
    importErrorAlertText.value = ''
    if (!isFormValid.value) {
      return
    }
    const file = files[0]
    readTableFile(file)
  })
}

const readTableFile = async (file: File) => {
  if (isLoadingImportedFile.value) {
    return
  }

  try {
    isLoadingImportedFile.value = true

    // Read Sheets
    const data = await file.arrayBuffer()
    const wb = XLSXRead(data)
    const sheets = wb.Sheets

    // Convert every sheet to array
    const sheetItem = Object.keys(sheets)
    let sheetList: string[][] = []
    sheetItem.forEach((item) => {
      const sheetJSON: string[][] = XLSXUtils.sheet_to_json(sheets[item], {
        header: 1,
        rawNumbers: false
      })
      if (sheetJSON.length) {
        sheetJSON.splice(0, 1)
      }
      sheetList = [...sheetList, ...sheetJSON]
    })

    // Remove duplicate wallet address and set array items
    const addressMap = new Map()
    const filteredList = sheetList
        .filter((item) => {
          const walletAddress = item[0] ? item[0].toLowerCase() : null
          const privateKey = item[1]
          if (!walletAddress || !privateKey || !isValidWalletAddress(walletAddress) || !isValidWalletPrivateKey(privateKey)) {
            return false
          } else if (!addressMap.has(walletAddress)) {
            addressMap.set(walletAddress, 1)
            return true
          } else {
            return false
          }
        })
        .map(item => {
          return {
            address: item[0],
            privateKey: item[1]
          }
        })

    if (!filteredList.length) {
      importErrorAlertText.value = t('importFileForm.notAvailable')
      return
    }

    // Get contract info and set address list
    for (const item of filteredList) {
      const isItemExists = addressList.value.some(addressItem => addressItem.address === item.address)
      if (!isItemExists) {
        const XENContract = getXENContract(chain, item.privateKey, provider)
        const userMintInfo = await XENContract.getUserMint()
        addressList.value = [
          ...addressList.value,
          {
            ...item,
            term: userMintInfo.term.toNumber(),
            maturityTs: userMintInfo.maturityTs.toNumber() * 1000,
            rank: userMintInfo.rank.toNumber(),
            amplifier: userMintInfo.amplifier.toNumber(),
            eaaRate: userMintInfo.amplifier.toNumber()
          }
        ]
      }
    }
  } catch (e) {
    const err = e as Error
    importErrorAlertText.value = err.message
  } finally {
    isLoadingImportedFile.value = false
  }
}

const checkImportedFileTypeIsValid = (file: File) => {
  const fileExtension = getFileExtension(file.name)
  return importedFileSupportedFileTypes.includes(fileExtension)
}

const clearAddressList = () => {
  addressList.value.length = 0
}

const toBatchClaimXEN = () => {
  const combinedAddressList = claimableAddressList.value.map(item => {
    return {
      ...item,
      balanceLoading: false,
      balance: null,
      claimStatus: 'INIT' as ClaimStatus,
      claimTransaction: null,
      transferStatus: 'INIT' as TransferStatus,
      transferTransaction: null
    }
  })
  setAddressStorage(combinedAddressList)
  router.push({
    name: 'ClaimXEN'
  })
}

onMounted(() => {
  // Set interval to update current time
  currentTimeInterval.value = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  // Clear interval before unmount component
  if (currentTimeInterval.value) {
    clearInterval(currentTimeInterval.value)
  }
})
</script>

<template>
  <div class="import-file">
    <VCard class="mb-5">
      <VCardTitle class="bg-deep-purple pa-4">
        {{ t('importFileForm.title') }}
      </VCardTitle>
      <VCardText class="pa-4">
        <div class="mb-5 d-flex align-center">
          <span>{{ t('importFileForm.desc') }}</span>
          <a
              class="text-deep-purple-accent-1 ml-2"
              href="/claim_address_example.xlsx"
              target="_blank"
              download
          >
            {{ t('importFileForm.template') }}
          </a>
        </div>
        <VForm
            v-model="isFormValid"
            class="mb-5"
        >
          <VFileInput
              v-model:model-value="importedFile"
              :rules="formRules.importedFile"
              :accept="importedFileAccepts"
              :label="t('importFileForm.placeholder')"
              prepend-icon="mdi-paperclip"
              :loading="isLoadingImportedFile"
              :disabled="isLoadingImportedFile"
              @update:model-value="updateImportedFile"
          />
        </VForm>
        <VAlert
            v-if="importErrorAlertText"
            :text="importErrorAlertText"
            type="error"
            class="mb-5"
        />
        <div class="text-center">
          <VBtn
              color="deep-purple"
              :disabled="!claimButtonAvailable"
              class="mb-2 px-10"
              @click="toBatchClaimXEN"
          >
            {{ t('toClaim') }}
          </VBtn>
          <p class="text-grey">{{ t('toClaimDesc') }}</p>
        </div>
      </VCardText>
    </VCard>
    <VCard>
      <VCardTitle class="pa-4 d-flex justify-space-between">
        <div>
          <span>{{ t('totalImported') }}: {{ addressList.length }}</span>
          <span class="ml-10">{{ t('currentClaimable') }}: {{ claimableAddressList.length }}</span>
        </div>
        <VBtn
            :disabled="isLoadingImportedFile"
            variant="outlined"
            @click="clearAddressList"
        >
          {{ t('clearAddresses') }}
        </VBtn>
      </VCardTitle>
      <VCardText class="pa-4">
        <VTable>
          <thead>
          <tr>
            <th>#</th>
            <th>{{ t('status') }}</th>
            <th>{{ t('walletAddress') }}</th>
            <th>{{ t('maturity') }}</th>
            <th>{{ t('term') }}</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(item, index) in addressList"
              :key="index"
          >
            <td>{{ index + 1 }}</td>
            <td class="d-flex align-center">
              <template v-if="item.maturityTs && currentTime >= item.maturityTs">
                <VIcon
                    color="success"
                    icon="mdi-check-circle"
                    size="18"
                />
                <span class="text-success ml-1">{{ t('currentClaimable') }}</span>
              </template>
              <template v-else-if="item.maturityTs && currentTime < item.maturityTs">
                <VIcon
                    color="warning"
                    icon="mdi-clock-outline"
                    size="18"
                />
                <span class="text-warning ml-1">
                  {{
                    getDateTimeDiffFromNow(item.maturityTs, `{d} ${t('datetime.days')} {hh} ${t('datetime.hours')} {mm} ${t('datetime.minutes')} {ss} ${t('datetime.seconds')}`)
                  }}
                </span>
              </template>
              <template v-else>
                <VIcon
                    color="error"
                    icon="mdi-alert-circle-outline"
                    size="18"
                />
                <span class="text-error ml-1">{{ t('noMintInfo') }}</span>
              </template>
            </td>
            <td>
              <a
                  :href="getBlockExplorerAddressLink(item.address, chain)"
                  target="_blank"
                  class="text-deep-purple-accent-1"
              >
                {{ item.address }}
              </a>
            </td>
            <td>{{ item.maturityTs ? dateFormatter(item.maturityTs) : '--' }}</td>
            <td>{{ item.term || '--' }}</td>
          </tr>
          </tbody>
        </VTable>
      </VCardText>
    </VCard>
  </div>
</template>
