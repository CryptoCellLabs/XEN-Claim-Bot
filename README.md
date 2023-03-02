# XEN-Claim-Bot

XEN-Claim-Bot is an automated robot tool for claiming XEN. Due to the significant fluctuations in Gwei value on the EVM network, controlling the cost of claiming XEN is especially important during times of low Gwei. This is particularly important for users with a large number of wallet addresses, as completing this process can require a significant amount of time and effort. XENClaimBot was designed and developed specifically for this scenario.

If you use XEN-Claim-Bot to perform the operation, you only need to import the wallet information that needs to be claimed, set the maximum acceptable Gwei value for the Claim XEN process, and specify the wallet address receive the XEN. The script will execute automatically during the process, including only necessary RPC connections with EVM nodes, and running locally in the user's browser.

XEN-Claim-Bot 是一个用于Claim XEN 的自动化机器人工具。由于 EVM 网络上 Gwei 值的显著波动，在 Gwei 较低的时候控制Claim XEN 的成本尤为重要。这对于拥有大量钱包地址的用户尤为重要，因为完成此过程可能需要大量时间和精力。 XENClaimBot 就是专门为这种场景设计和开发的。

如果使用XEN-Claim-Bot进行操作，只需要导入需要领取的钱包信息，设置Claim XEN流程可接受的最大Gwei值，指定接收XEN的钱包地址即可。脚本会在这个过程中自动执行，只包括与 EVM 节点必要的 RPC 连接，并在用户浏览器本地运行。

## Project Setup

```sh
yarn install
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```
