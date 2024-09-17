---
layout: post
title: "蓝桥杯国赛JavaB组2023"
date:   2024-7-06
tags: [算法]
comments: true
author: marshall
---

本文记录了2023蓝桥杯国赛JavaB组的部分题解

<!-- more -->
<!-- meta name="description" -->

## 1.互质

```java
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	static int MOD = (int)1e9+7;
	public static long qmi(int a, int k, int p) {
		long res = 1;
		while(k > 0) {
			if ((k & 1) == 1) res = res * a % p;
			a = (int)((long) a * a % p);
			k = k >> 1;
		}
		return res;
	}
	public static long gbd(long a, long b) {
		return b == 0 ? a : gbd(b, a % b);
	}
	public static void main(String[] args) {
		
		long res = qmi(2023, 2023, MOD);
		long a = qmi(2023, 2023, MOD) * qmi(7, MOD-2, MOD) % MOD;
		long b = qmi(2023, 2023, MOD) * qmi(17, MOD-2, MOD) % MOD;
		long c = qmi(2023, 2023, MOD) * qmi(17 * 7, MOD-2, MOD) % MOD;
		
		res = (res - a - b + c) % MOD;
		System.out.println(res);
		
	}
}
// 640720414
```



## 2. 逆元

```java
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	static int MOD = (int)2146516019;
	public static long qmi(int a, int k, int p) {
		long res = 1;
		while(k > 0) {
			if ((k & 1) == 1) res = res * a % p;
			a = (int)((long) a * a % p);
			k = k >> 1;
		}
		return res;
	}
	public static long gbd(long a, long b) {
		return b == 0 ? a : gbd(b, a % b);
	}
	public static void main(String[] args) {
		long res = 0;
		for(int i = 1; i <= 233333333; i++) {
			res ^= qmi(i, MOD-2, MOD);
		}
		
		System.out.println(res);
		
	}
}
// 

```



## 3.礼物

```java
// 通过率20%
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	static int N = 100010;
	static int[] gifts = new int[2*N];
	public static void main(String[] args) {
		int n = sc.nextInt();
		for(int i = 0; i < 2 * n; i++) {
			gifts[i] = sc.nextInt();
		}
		Arrays.sort(gifts,0,2*n);
		long res = 0;
		for(int i = 0; i < n; i++) {
			int x = gifts[i] * gifts[2*n-i-1];
			res += x;
		}
		System.out.println(res);
	}
}

// 不开long long 见祖宗 ，通过率100%
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	static int N = 100010;
	static long[] gifts = new long[2*N];
	public static void main(String[] args) {
		int n = sc.nextInt();
		for(int i = 0; i < 2 * n; i++) {
			gifts[i] = sc.nextLong();
		}
		Arrays.sort(gifts,0,2*n);
		long res = 0;
		for(int i = 0; i < n; i++) {
			long x = gifts[i] * gifts[2*n-i-1];
			res += x;
		}
		System.out.println(res);
	}
}
// 1307261675
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);

	public static void main(String[] args) {
		System.out.println(1307261675);
	}
}
```

## 4.不完整算式

```java
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	public static void main(String[] args) {
		char[] str = sc.next().toCharArray();
		String A = "", B = "", C = "", OP = "";
		int flag = 0;
		int j = 0;
		// 取A
		if (str[j] == '?' ) {	
			flag = 1;
			j++;
		}else {
			while(Character.isDigit(str[j])){
				A += str[j];
				j++;
			}
		}
		
		// 取OP
		if(str[j] == '?') {
			flag = 2;
			j++;
		}else {
			OP += str[j++];
		}
		
		// 取B
		if (str[j] == '?' ) {	
			flag = 3;
			j++;
		}else {
			while(Character.isDigit(str[j])){
				B += str[j];
				j++;
			}
		}
		
		// 跳过=
		j++;
		
		//取C
		if (str[j] == '?' ) {	
			flag = 4;
			j++;
		}else {
			while(j < str.length && Character.isDigit(str[j])){
				C += str[j];
				j++;
			}
		}
		
		if(flag == 1) {
			int b = Integer.parseInt(B);
			int c = Integer.parseInt(C);
			if (OP.equals("+")) {
				System.out.println(c - b);
			}else if (OP.equals("-")) {
				System.out.println(c+b);
			}else if (OP.equals("*")) {
				System.out.println(c/b);
			}else {
				System.out.println(c * b);
			}
		}else if(flag == 2) {
			int a = Integer.parseInt(A);
			int b = Integer.parseInt(B);
			int c = Integer.parseInt(C);
			if (a + b == c) System.out.println("+");
			else if (a - b == c) System.out.println("-");
			else if (a * b == c) System.out.println("*");
			else System.out.println("/");
		}else if (flag == 3) {
			int a = Integer.parseInt(A);
			int c = Integer.parseInt(C);
			if (OP.equals("+")) {
				System.out.println(c - a);
			}else if (OP.equals("-")) {
				System.out.println(a-c);
			}else if (OP.equals("*")) {
				System.out.println(c/a);
			}else {
				System.out.println(a/c);
			}
		}else {
			int a = Integer.parseInt(A);
			int b = Integer.parseInt(B);
			if (OP.equals("+")) {
				System.out.println(a + b);
			}else if (OP.equals("-")) {
				System.out.println(a - b);
			}else if (OP.equals("*")) {
				System.out.println(a * b);
			}else {
				System.out.println(a / b);
			}
		}
		
		
	}
}
```

## 5.星球

```java
// 状态压缩DP
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	static int N = 20,n;
	static double[][] dp = new double[1 << N][N];
	static Pair[] stars = new Pair[N];
	public static void main(String[] args) {
		n = sc.nextInt();
		for(int i = 0; i < n; i++) {
			stars[i] = new Pair(sc.nextInt(), sc.nextInt(), sc.nextInt(), sc.nextInt());
		}
		for(int i = 0; i < 1 << N; i++) {
			Arrays.fill(dp[i], -1);
		}
		double res = Double.MAX_VALUE;
		for(int i = 0; i < n; i++) {
			res = Math.min(res, dfs(0,i));
		}
		
		System.out.printf("%.2f",res);
	}
	
	public static double dfs(int s, int i) {
		if (s == (1 << n) - 1) {
			return 0;
		}
		
		if (dp[s][i] != -1) {
			return dp[s][i];
		}
		
		double res = Double.MAX_VALUE;
		for(int j = 0; j < n; j++) {
			if ( ((s >> j) & 1) == 1) {
				continue;
			}
			res = Math.min(res, dfs(s | 1 << j, j) + stars[j].w * getDistance(stars[i], stars[j]));
		}
		
		return dp[s][i] = res;
	}
	
	
	
	public static double getDistance(Pair a, Pair b) {
		return Math.sqrt((a.x - b.x) * (a.x - b.x) +
						(a.y - b.y) * (a.y - b.y) +
						(a.z - b.z) * (a.z - b.z));
	}
}


class Pair {
	int x;
	int y;
	int z;
	int w;
	public Pair(int _x, int _y, int _z, int _w) {
		this.x = _x;
		this.y = _y;
		this.z = _z;
		this.w = _w;
	}
}
```

## 6. 序列

```java
// 勾八数论题
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	static int N = 100010, n;
	public static long gcd(long a, long b) {
		return b == 0 ? a : gcd(b, a % b);
	}
	
	public static long lcm(long a, long b) {
		return a / gcd(a, b) * b;
	}
	public static void main(String[] args) {
		long res = 0;
		n = sc.nextInt();
		for(int i = 1; i <= n; i++) {
			int x = sc.nextInt();
			res += (long)n * i / lcm(x, i);
		}
		
		System.out.println(res);
	}
}
```

## 7. 电动车

```java
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	static int N = 200010,n,m;
	static int[] p = new int[N];
	static edge[] edges = new edge[N];
	public static int find(int x) {
		if (p[x] != x) p[x] = find(p[x]);
		return p[x];
	}
	public static void main(String[] args) {
		n = sc.nextInt();
		m = sc.nextInt();
		int res = -0x3f3f3f3f,cnt=0;
		for(int i = 0; i < m; i++) {
			int a = sc.nextInt();
			int b = sc.nextInt();
			int w = sc.nextInt();
			edges[i] = new edge(a, b, w);
		}
		for(int i = 1; i <= n; i++) p[i] = i;
		Arrays.sort(edges,0,m);
		for(int i = 0; i < m; i++) {
			int a = edges[i].a;
			int b = edges[i].b;
			if (find(a) != find(b)) {
				p[find(a)] = find(b);
				cnt++;
				res = Math.max(res, edges[i].w);
			}
		}
		if(cnt < n - 1) System.out.println("-1");
		else System.out.println(res);
		
	}
}

class edge implements Comparable<edge>{
	int a;
	int b;
	int w;
	public edge(int _a, int _b, int _w) {
		this.a = _a;
		this.b = _b;
		this.w = _w;
	}
	
	@Override
	public int compareTo(edge o) {
		return Integer.compare(this.w, o.w);
	}
}
```

## 8. 游戏

```java
import java.util.*;

public class Main {
	static final Scanner sc = new Scanner(System.in);
	static int N = 100010,n,k;
	static int hh = 0, tt = -1;
	static int[] q = new int[N], a = new int[N];
	static int[] t1 = new int[N], t2 = new int[N];
	public static void main(String[] args) {
		n = sc.nextInt();
		k = sc.nextInt();
		for(int i = 0; i < n; i++) a[i] = sc.nextInt();
		long sumMax = 0;
		for(int i = 0; i < n; i++) {
			if (hh <= tt && q[hh] < i - k + 1) hh++;
			while(hh <= tt && a[q[tt]] <= a[i]) tt--;
			q[++tt] = i;
			if(i >= k - 1) sumMax += a[q[hh]];
		}
		
		hh = 0;tt = -1;
		long sumMin = 0;
		for(int i = 0; i < n; i++) {
			if (hh <= tt && q[hh] < i - k + 1) hh++;
			while(hh <= tt && a[q[tt]] >= a[i]) tt--;
			q[++tt] = i;
			if(i >= k - 1) sumMin += a[q[hh]];
		}
//		System.out.println(sumMax + " " + sumMin);
		double res = (sumMax - sumMin) * 1.0 / (n - k + 1);
		System.out.println(res);
		
	}
}
```

