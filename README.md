# XEN-Claim-Bot

XEN-Claim-Bot is an automated robot tool for claiming XEN. Due to the significant fluctuations in Gwei value on the EVM network, controlling the cost of claiming XEN is especially important during times of low Gwei. This is particularly important for users with a large number of wallet addresses, as completing this process can require a significant amount of time and effort. XENClaimBot was designed and developed specifically for this scenario.

If you use XEN-Claim-Bot to perform the operation, you only need to import the wallet information that needs to be claimed, set the maximum acceptable Gwei value for the Claim XEN process, and specify the wallet address receive the XEN. The script will execute automatically during the process, including only necessary RPC connections with EVM nodes, and running locally in the user's browser.

XEN-Claim-Bot 是一个用于Claim XEN 的自动化机器人工具。由于 EVM 网络上 Gwei 值的显著波动，在 Gwei 较低的时候控制Claim XEN 的成本尤为重要。这对于拥有大量钱包地址的用户尤为重要，因为完成此过程可能需要大量时间和精力。 XENClaimBot 就是专门为这种场景设计和开发的。

如果使用XEN-Claim-Bot进行操作，只需要导入需要领取的钱包信息，设置Claim XEN流程可接受的最大Gwei值，指定接收XEN的钱包地址即可。脚本会在这个过程中自动执行，只包括与 EVM 节点必要的 RPC 连接，并在用户浏览器本地运行。

------------------------------
Update 2023/05/04
------------------------------
一些用户给我们反馈ClaimBot使用上的一些担忧，我们综合征求了用户意见后决定不再提供这个功能。

如果你还需要这个自动化工具，请自行到Github上下载到本地运行，ClaimBot已经完全开源。

你可以github源码的基础上任意修改，无需经过我们的许可。

Some users have given us some concerns about the ClaimBot. 
We decided not to provide this function. 

If you still need this auto claim tool, please download sourcecode from Github and run it locally. 
ClaimBot is completely open source.

If you have the need to auto Claim, you can modify it arbitrarily based on the github source code without our permission.


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
