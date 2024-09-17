---
layout: post
title: "蓝桥杯国赛JavaB组2021"
date:   2024-7-06
tags: [算法]
comments: true
author: marshall
---

本文记录了2021蓝桥杯国赛JavaB组的部分题解

<!-- more -->
<!-- meta name="description" -->

## 1. 整数范围

```java
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);

	public static void main(String[] args) {
		System.out.println((int)Math.pow(2, 8) - 1);
	}
}
```

## 2. 纯质数

```java
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	static int N = 20210610,n,cnt;
	static boolean[] st = new boolean[N];
	static int[] p = new int[N];
	public static void get_p(int num) {
		for(int i = 2; i <= num; i++) {
			if (!st[i]) p[cnt++] = i;
			for(int j = 0; p[j] <= num / i; j++) {
				st[p[j] * i] = true;
				if (i % p[j] == 0) break;
			}
		}
	}
	
	public static void main(String[] args) {
		n = 20210605;
		int[] a = new int[] {2,3,5,7};
		get_p(n);
		int res = 0;
		for(int i = 0; i < cnt; i++) {
			int x = p[i];
			boolean flag = true;
			while(x > 0) {
				int t = x % 10;
				if (t != 2 && t != 3 && t != 5 && t != 7) {
					flag = false;
					break;
				}
				x /= 10;
			}
			if (x > 0 && x != 2 && x != 3 && x != 5 && x != 7) flag = false; 
			if (flag) res++;
		}
		System.out.println(res);
		
	}
}
```

## 3. 完全日期

```java
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);

	public static void main(String[] args) {
		int cnt = 0;
		for(int i = 2001; i <= 2021; i++) {
			for(int j = 1; j <= 12; j++) {
				int k = getDay(i, j);
				for(int t = 1; t <= k; t++) {
					int sum = getSum(i) + getSum(j) + getSum(t);
					if (Math.sqrt(sum) == (int)Math.sqrt(sum)) {
						cnt++;
					}
				}
			}
		}
		System.out.println(cnt);
	}
	
	public static int getDay(int y, int m) {
		int[] day = {31,0,31,30,31,30,31,31,30,31,30,31};
		if (m != 2) {
			return day[m-1];
		}
		if ((y % 4 == 0 && y % 100 != 0) || (y % 400 == 0)) {
			return 29;
		}
		return 28;
	}
	public static int getSum(int num) {
		int sum = 0;
		while(num != 0) {
			sum += num % 10;
			num /= 10;
		}
		return sum;
	}
}
```

## 4. 最小权值

```java
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	static int N = 2030;
	static long[] dp = new long[N];
	public static void main(String[] args) {
		Arrays.fill(dp, 0x3f3f3f3f);
		dp[0] = 0;
		dp[1] = 1;
		for(int i = 2; i <= 2021; i++) {
			dp[i] = 1 + 2 * dp[i-1];
			for(int j = 1; j < i; j++) {
				dp[i] = Math.min(dp[i], 1 + 2 * dp[j] + 3 * dp[i - 1 - j] + j * j * (i - 1 - j));
			}
		}
		
		System.out.println(dp[2021]);
	}
}
```

## 5. 大写

```java
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);

	public static void main(String[] args) {
		String str = sc.next();
		System.out.println(str.toUpperCase());
	}
}
```

## 6. 123

```java
// 过70%样例
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	public static long get(int x, int y) {
		long res = 0;
		for(int i = x; i <= y; i++) {
			res += (1 + i) * i / 2;
		}
		return res;
	}
	public static int find(int d) {
		for(int i = 1; i <= d; i++) {
			if ((i + 1) * i / 2 >= d) {
				return i;
			}
		}
		return 0;
	}
	public static void main(String[] args) {
		int t = sc.nextInt();
		while(t-->0) {
			long res = 0;
			int l = sc.nextInt();
			int r = sc.nextInt();
			int x = find(l);
			int y = find(r);
			if (x != y) {
				if (x+1 <= y-1) res += get(x+1, y-1);
				l -= x * (x - 1) / 2;
				r -= y * (y - 1) / 2;
				res += (l + x) * (x - l + 1) / 2;
				res += (1 + r) * r / 2;
			}
			else {
				l -= x * (x - 1) / 2;
				r -= y * (y - 1) / 2;
				res += (l + r) * (r - l + 1) / 2;
			}
			System.out.println(res);
		}
	}
}
```

## 7. 和与乘积

## 8. 巧克力

```java
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	static int N = 100010,n,x;
	public static void main(String[] args) {
		x = sc.nextInt();
		n = sc.nextInt();
		choc[] chocs = new choc[n];
		for(int i = 0; i < n; i++) {
			chocs[i] = new choc(sc.nextInt(), sc.nextInt(), sc.nextInt());
		}
		// 优先保证保质期
		Arrays.sort(chocs,(o1,o2)->{
			if (o1.b != o2.b) {
				return o2.b - o1.b;
			}else {
				return o1.a - o2.a;
			}
		});
		// 优先队列根据价格排序
		PriorityQueue<choc> pq = new PriorityQueue<>((o1,o2) -> o1.a - o2.a);
		long cost = 0; // 记录总花费
		int pos = 0;  // 记录巧克力的索引
		for(int i = x; i >= 1; i--) {
			while(pos < n && chocs[pos].b >= i) {
				pq.add(chocs[pos]);
				pos++;
			}
			
			if (pq.isEmpty()) {
				System.out.println("-1");
				return;
			}
			
			choc t = pq.poll();
			cost += t.a;
			t.c--;
			if (t.c > 0) {
				pq.add(t);
			}
		}
		
		System.out.println(cost);
	}
}

class choc{
	int a;
	int b;
	int c;
	public choc(int a, int b, int c) {
		this.a = a;
		this.b = b;
		this.c = c;
	}
}
```

