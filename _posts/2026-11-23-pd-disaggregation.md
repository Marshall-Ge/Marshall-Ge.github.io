---
pdf: /assets/pdfs/2026-11-23-pd-disaggregation.pdf
layout: post
title: "做 PD 分离时，我们到底在做些什么"
date: 2026-11-23
tags: ["LLM","推理优化","PD分离"]
comments: true
author: marshall
latex: true
---
初识 PD 分离 众所周知，大模型的推理分为两个环节： Prefill：对输入序列进行一次完整的模型前向（forward）计算，产出第一个 Token 以及输入序列的 KV Cache； Decode：利用 Prefill 阶段产生的 KV Cache，重复进行多次模型的前向，自回归产出新的 Token 作为模型的输出。 我们深入一点来分析，就可以知道这两个阶段的计算负载完全是两种情况： 对于…

<!-- more -->
