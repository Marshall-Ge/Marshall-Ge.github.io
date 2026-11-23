---
pdf: /assets/pdfs/2026-11-23-deepinfer-within.pdf
layout: post
title: "DeepInfer之内：专模型专框架专硬件的趋势"
date: 2026-11-23
tags: ["AI Infra","推理优化","DeepInfer"]
comments: true
author: marshall
latex: true
---
过去很长一段时间里，通用推理引擎（vLLM / SGLang）主导着社区的技术栈，然而在最近出现了一些新的趋势。如果我们从推理系统的四个硬指标来看—— 有效算力（MFU） 、 显存带宽与容量利用率（MBU / KV 占用） 、 跨卡通信延迟占比 ，以及 Infra 维护与迭代成本 ——就能看到最近一两年推理栈正在发生一个很清晰的转向： 专模型、专框架、专硬件 的三层协同设计，下图就是…

<!-- more -->
