---
pdf: /assets/pdfs/2026-11-23-sparse-linear-attention.pdf
layout: post
title: "浅析稀疏/线形注意力路线之争"
date: 2026-11-23
tags: ["注意力","稀疏注意力","线形注意力"]
comments: true
author: marshall
latex: true
---
当现代 LLM 的上下文窗口向着 1M 扩展的时候，标准 Softmax Attention 的 算力成本和线形的 KV Cache 显存开销逐渐变得难以让人接受，目前逐渐收敛到了两条技术路线： 稀疏注意力（Sparse）：选择部分位置的 KV Cache 进行计算。 线形注意力（Linear）：通过状态压缩，将历史信息压缩进一个固定大小的状态矩阵。 评析视角与方法论…

<!-- more -->
