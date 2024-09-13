---
layout: post
title: "数据结构——树"
date:   2024-9-12
tags: [数据结构]
comments: true
author: marshall
---

## 分支无限制的有根树

**左孩子右兄弟表示法**，每个节点包含一个父结点指针以及另外两个指针：1. x.left-child 指向结点x最左边的孩子结点。2. x.right-sibling指向x右侧相邻的兄弟结点。

如果结点x没有孩子结点，则x.left-child=NIL；如果结点x是其父结点的最右孩子，则x.right-sibling=NIL。

