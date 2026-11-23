---
pdf: /assets/pdfs/2026-11-23-deepinfer-beyond.pdf
layout: post
title: "DeepInfer之外：房间里的大象——集群Infra"
date: 2026-11-23
tags: ["AI Infra","集群","KV Cache"]
comments: true
author: marshall
latex: true
---
DeepInfer 开源之后，社区把很多注意力放在了它释放出来的引擎层能力上：FlashMLA、DeepGEMM、DeepEP、DSpark 投机解码，以及 SWA Bounded Replay 等等。但如果你仔细看 DeepInfer 仓库的 README，就会发现它在最后列了三件“本次开源未包含、但完整在线服务必须具备”的东西： KV Cache 系统 、 VE/Prefill/Decode…

<!-- more -->
