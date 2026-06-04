const newProblems = [
  // ─── 1. ARRAYS & HASHING (10 Questions) ───
  {
    title: "Contains Duplicate",
    description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.\n\nExample:\nInput: nums = [1,2,3,1]\nOutput: true",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse a Hash Set to track visited numbers. If a number has been seen, return true.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(N)",
    tags: ["Array", "Hash Table"],
    testCases: [
      { input: "1 2 3 1", expected_output: "true", is_sample: true },
      { input: "1 2 3 4", expected_output: "false", is_sample: true },
      { input: "1 1 2", expected_output: "true", is_sample: false }
    ]
  },
  {
    title: "Valid Anagram",
    description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nExample:\nInput: s = \"anagram\", t = \"nagaram\"\nOutput: true",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nCount frequencies of characters in both strings. If they match, it is a valid anagram.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(1) (since character set size is fixed at 26)",
    tags: ["String", "Hash Table", "Sorting"],
    testCases: [
      { input: "anagram\nnagaram", expected_output: "true", is_sample: true },
      { input: "rat\ncar", expected_output: "false", is_sample: true },
      { input: "a\nb", expected_output: "false", is_sample: false }
    ]
  },
  {
    title: "Group Anagrams",
    description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.\n\nExample:\nInput: strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]\nOutput: [[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nSort each string alphabetically and use it as a hash map key, grouping original strings as lists of values.\n\n### Complexity\n- **Time:** O(N * K log K) where K is max string length.\n- **Space:** O(N * K)",
    tags: ["Array", "Hash Table", "String", "Sorting"],
    testCases: [
      { input: "eat tea tan ate nat bat", expected_output: "[[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]", is_sample: true },
      { input: "a", expected_output: "[[\"a\"]]", is_sample: true }
    ]
  },
  {
    title: "Top K Frequent Elements",
    description: "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.\n\nExample:\nInput: nums = [1,1,1,2,2,3], k = 2\nOutput: [1,2]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nCount frequencies of elements. Use a bucket sort array where index represents frequency to retrieve top elements in linear time.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(N)",
    tags: ["Array", "Hash Table", "Heap", "Sorting", "Bucket Sort"],
    testCases: [
      { input: "1 1 1 2 2 3\n2", expected_output: "1 2", is_sample: true },
      { input: "1\n1", expected_output: "1", is_sample: true }
    ]
  },
  {
    title: "Product of Array Except Self",
    description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].\n\nYou must write an algorithm that runs in O(n) time and without using the division operation.\n\nExample:\nInput: nums = [1,2,3,4]\nOutput: [24,12,8,6]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nCalculate prefix products and suffix products. Combine them in a single array to achieve O(1) auxiliary space.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(1)",
    tags: ["Array", "Prefix Sum"],
    testCases: [
      { input: "1 2 3 4", expected_output: "24 12 8 6", is_sample: true },
      { input: "-1 1 0 -3 3", expected_output: "0 0 9 0 0", is_sample: true }
    ]
  },
  {
    title: "Longest Consecutive Sequence",
    description: "Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in O(n) time.\n\nExample:\nInput: nums = [100,4,200,1,3,2]\nOutput: 4\nExplanation: The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nInsert numbers into a Set. Iterate through numbers; if a number is the start of a sequence (i.e. `num - 1` is not in Set), count the sequence length upwards.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(N)",
    tags: ["Array", "Hash Table", "Union Find"],
    testCases: [
      { input: "100 4 200 1 3 2", expected_output: "4", is_sample: true },
      { input: "0 3 7 2 5 8 4 6 0 1", expected_output: "9", is_sample: true }
    ]
  },
  {
    title: "Valid Sudoku",
    description: "Determine if a 9 x 9 Sudoku board is valid. Only the filled cells must be validated according to the Sudoku rules: rows, columns, and 3x3 sub-boxes must not contain duplicate numbers 1-9.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse sets to store visited values for each row, column, and 3x3 sub-box. Check each element and report conflicts.",
    tags: ["Array", "Hash Table", "Matrix"],
    testCases: [
      { input: "valid_sudoku_board_input", expected_output: "true", is_sample: true }
    ]
  },
  {
    title: "Encode and Decode Strings",
    description: "Design an algorithm to encode a list of strings to a single string. The encoded string is then sent over the network and decoded back to the original list of strings.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse length-prefix encoding. Prepend the length of each string followed by a delimiter (e.g. `length + '#'`) to the string to safely partition them.",
    tags: ["Array", "String"],
    testCases: [
      { input: "hello world", expected_output: "hello world", is_sample: true },
      { input: "lint code love you", expected_output: "lint code love you", is_sample: true }
    ]
  },
  {
    title: "Subarray Sum Equals K",
    description: "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals to k.\n\nExample:\nInput: nums = [1,1,1], k = 2\nOutput: 2",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse prefix sum cumulative counts stored in a hash map. For each prefix sum, check if `cumulativeSum - k` exists in the map.",
    tags: ["Array", "Hash Table", "Prefix Sum"],
    testCases: [
      { input: "1 1 1\n2", expected_output: "2", is_sample: true },
      { input: "1 2 3\n3", expected_output: "2", is_sample: true }
    ]
  },
  {
    title: "Sort Colors",
    description: "Given an array nums with n objects colored red, white, or blue, sort them in-place so that objects of the same color are adjacent, with the colors in the order red, white, and blue.\n\nExample:\nInput: nums = [2,0,2,1,1,0]\nOutput: [0,0,1,1,2,2]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse the Dutch National Flag algorithm with three pointers: low, mid, and high. Swap elements to partition 0s, 1s, and 2s.",
    tags: ["Array", "Two Pointers", "Sorting"],
    testCases: [
      { input: "2 0 2 1 1 0", expected_output: "0 0 1 1 2 2", is_sample: true },
      { input: "2 0 1", expected_output: "0 1 2", is_sample: true }
    ]
  },

  // ─── 2. TWO POINTERS (10 Questions) ───
  {
    title: "Valid Palindrome",
    description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nExample:\nInput: s = \"A man, a plan, a canal: Panama\"\nOutput: true",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse two pointers at opposite ends of the string. Advance past non-alphanumeric characters and compare letters, ignoring case.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(1)",
    tags: ["Two Pointers", "String"],
    testCases: [
      { input: "A man, a plan, a canal: Panama", expected_output: "true", is_sample: true },
      { input: "race a car", expected_output: "false", is_sample: true },
      { input: " ", expected_output: "true", is_sample: false }
    ]
  },
  {
    title: "Two Sum II - Input Array Is Sorted",
    description: "Given a 1-indexed array of integers numbers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number.\n\nExample:\nInput: numbers = [2,7,11,15], target = 9\nOutput: [1,2]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse two pointers: left at start, right at end. If sum is smaller than target, increment left. If larger, decrement right.",
    tags: ["Array", "Two Pointers", "Binary Search"],
    testCases: [
      { input: "2 7 11 15\n9", expected_output: "1 2", is_sample: true },
      { input: "2 3 4\n6", expected_output: "1 3", is_sample: true }
    ]
  },
  {
    title: "3Sum",
    description: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nExample:\nInput: nums = [-1,0,1,2,-1,-4]\nOutput: [[-1,-1,2],[-1,0,1]]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nSort the array first. Iterate through elements; for each element, run a two-pointer search on the remaining suffix to find pairs that sum to its negation. Skip duplicate numbers.",
    tags: ["Array", "Two Pointers", "Sorting"],
    testCases: [
      { input: "-1 0 1 2 -1 -4", expected_output: "[[-1,-1,2],[-1,0,1]]", is_sample: true },
      { input: "0 1 1", expected_output: "[]", is_sample: true }
    ]
  },
  {
    title: "4Sum",
    description: "Given an array nums of n integers, return an array of all the unique quadruplets [nums[a], nums[b], nums[c], nums[d]] such that the elements sum up to target.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nSort the array. Fix the first two numbers using nested loops, then use the two-pointer technique on the remaining array suffix to find the remaining two numbers.",
    tags: ["Array", "Two Pointers", "Sorting"],
    testCases: [
      { input: "1 0 -1 0 -2 2\n0", expected_output: "[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]", is_sample: true }
    ]
  },
  {
    title: "Move Zeroes",
    description: "Given an integer array nums, move all 0's to the end of it while maintaining the relative order of the non-zero elements in-place.\n\nExample:\nInput: nums = [0,1,0,3,12]\nOutput: [1,3,12,0,0]",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse a slow-runner pointer tracking where the next non-zero element should go. Swapping elements as we encounter non-zero values maintains the correct in-place order.",
    tags: ["Array", "Two Pointers"],
    testCases: [
      { input: "0 1 0 3 12", expected_output: "1 3 12 0 0", is_sample: true },
      { input: "0", expected_output: "0", is_sample: true }
    ]
  },
  {
    title: "Remove Duplicates from Sorted Array",
    description: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. Return the number of unique elements.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nSince array is sorted, keep a pointer for unique insertions. Advance the explorer; whenever a number differs from unique cursor, increment cursor and swap.",
    tags: ["Array", "Two Pointers"],
    testCases: [
      { input: "1 1 2", expected_output: "2", is_sample: true },
      { input: "0 0 1 1 1 2 2 3 3 4", expected_output: "5", is_sample: true }
    ]
  },
  {
    title: "Squares of a Sorted Array",
    description: "Given an integer array nums sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse two pointers at opposite ends of the array. Compare squared values; insert the larger square at the end of the result array and move pointer inward.",
    tags: ["Array", "Two Pointers", "Sorting"],
    testCases: [
      { input: "-4 -1 0 3 10", expected_output: "0 1 9 16 100", is_sample: true }
    ]
  },
  {
    title: "Valid Palindrome II",
    description: "Given a string s, return true if the s can be palindrome after deleting at most one character from it.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nCompare characters using two pointers. If there is a mismatch, check if deleting either character yields a valid substring palindrome.",
    tags: ["Two Pointers", "String"],
    testCases: [
      { input: "aba", expected_output: "true", is_sample: true },
      { input: "abca", expected_output: "true", is_sample: true },
      { input: "abc", expected_output: "false", is_sample: false }
    ]
  },
  {
    title: "Backspace String Compare",
    description: "Given two strings s and t, return true if they are equal when both are typed into empty text editors. '#' means a backspace character.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nIterate from right to left using pointers. Skip characters as dictated by '#' count. Compare active elements step-by-step.",
    tags: ["Two Pointers", "String", "Stack", "Simulation"],
    testCases: [
      { input: "ab#c\nad#c", expected_output: "true", is_sample: true },
      { input: "a#c\nb", expected_output: "false", is_sample: true }
    ]
  },
  {
    title: "Partition Labels",
    description: "You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nPrecompute the last occurrence index of each character. Loop through characters, shifting partition boundaries to match the maximum last-index encountered.",
    tags: ["Hash Table", "Two Pointers", "String", "Greedy"],
    testCases: [
      { input: "ababcbacadefegdehijhklij", expected_output: "9 7 8", is_sample: true }
    ]
  },

  // ─── 3. SLIDING WINDOW (10 Questions) ───
  {
    title: "Best Time to Buy and Sell Stock",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Return the maximum profit you can achieve.\n\nExample:\nInput: prices = [7,1,5,3,6,4]\nOutput: 5",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nTrack the minimum price seen so far. For each price, calculate profit relative to the minimum and update max profit.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(1)",
    tags: ["Array", "Dynamic Programming"],
    testCases: [
      { input: "7 1 5 3 6 4", expected_output: "5", is_sample: true },
      { input: "7 6 4 3 1", expected_output: "0", is_sample: true }
    ]
  },
  {
    title: "Longest Repeating Character Replacement",
    description: "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. Return the length of the longest substring containing the same letter you can get after performing at most k operations.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse a sliding window. Track frequency of characters inside the window. If `windowLength - maxFreq > k`, contract window from the left.",
    tags: ["Hash Table", "String", "Sliding Window"],
    testCases: [
      { input: "ABAB\n2", expected_output: "4", is_sample: true },
      { input: "AABABBA\n1", expected_output: "4", is_sample: true }
    ]
  },
  {
    title: "Permutation in String",
    description: "Given two strings s1 and s2, return true if s2 contains a permutation of s1, or false otherwise.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse a sliding window matching the length of `s1`. Track character counts of both `s1` and the active window in `s2`. Compare arrays.",
    tags: ["Hash Table", "Two Pointers", "String", "Sliding Window"],
    testCases: [
      { input: "ab\neidbaooo", expected_output: "true", is_sample: true },
      { input: "ab\neidboaoo", expected_output: "false", is_sample: true }
    ]
  },
  {
    title: "Minimum Window Substring",
    description: "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse sliding window with two pointers. Expand right until window is valid (has all characters of t). Then contract left to find the minimal index range.",
    tags: ["Hash Table", "String", "Sliding Window"],
    testCases: [
      { input: "ADOBECODEBANC\nABC", expected_output: "BANC", is_sample: true }
    ]
  },
  {
    title: "Sliding Window Maximum",
    description: "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. Return the max sliding window.",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse a deque storing indices. Keep elements in deque in monotonically decreasing order. Pop from front when element falls outside window.",
    tags: ["Array", "Queue", "Sliding Window", "Monotonic Queue", "Heap"],
    testCases: [
      { input: "1 3 -1 -3 5 3 6 7\n3", expected_output: "3 3 5 5 6 7", is_sample: true }
    ]
  },
  {
    title: "Find All Anagrams in a String",
    description: "Given two strings s and p, return an array of all the start indices of p's anagrams in s. You may return the answer in any order.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse a sliding window of size `p.length` on string `s`. Maintain arrays tracking counts, shifting window and comparing count states.",
    tags: ["Hash Table", "String", "Sliding Window"],
    testCases: [
      { input: "cbaebabacd\nabc", expected_output: "0 6", is_sample: true }
    ]
  },
  {
    title: "Minimum Size Subarray Sum",
    description: "Given an array of positive integers nums and a positive integer target, return the minimal length of a subarray whose sum is greater than or equal to target.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nSliding window. Expand right. As soon as current sum >= target, update minimal length and increment left index to shrink the window.",
    tags: ["Array", "Two Pointers", "Binary Search", "Sliding Window"],
    testCases: [
      { input: "2 3 1 2 4 3\n7", expected_output: "2", is_sample: true }
    ]
  },
  {
    title: "Max Consecutive Ones III",
    description: "Given a binary array nums and an integer k, return the maximum number of consecutive 1's in the array if you can flip at most k 0's.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nSliding window tracking the number of zeros in current frame. If zeros exceed `k`, shrink window from left until count is safe.",
    tags: ["Array", "Binary Search", "Sliding Window", "Prefix Sum"],
    testCases: [
      { input: "1 1 1 0 0 0 1 1 1 1 0\n2", expected_output: "6", is_sample: true }
    ]
  },
  {
    title: "Fruit Into Baskets",
    description: "You are visiting a farm that has a single row of fruit trees. You have two baskets, each basket can only hold a single type of fruit. Return the max fruits you can collect.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nThis is equivalent to finding the length of the longest subarray containing at most 2 distinct integers using sliding window.",
    tags: ["Array", "Hash Table", "Sliding Window"],
    testCases: [
      { input: "1 2 1", expected_output: "3", is_sample: true },
      { input: "0 1 2 2", expected_output: "3", is_sample: true }
    ]
  },
  {
    title: "Subarrays with K Different Integers",
    description: "Given an integer array nums and an integer k, return the number of good subarrays of nums. A good subarray is one containing exactly k different integers.",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nCalculate the count of subarrays with at most k distinct integers, and subtract the count of subarrays with at most k - 1 distinct integers.",
    tags: ["Array", "Hash Table", "Sliding Window"],
    testCases: [
      { input: "1 2 1 2 3\n2", expected_output: "7", is_sample: true }
    ]
  },

  // ─── 4. STACK (10 Questions) ───
  {
    title: "Valid Parentheses",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nExample:\nInput: s = \"()\"\nOutput: true",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nPush open brackets onto a Stack. When a closing bracket is seen, check if stack is not empty and matches the top element. Pop top bracket.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(N)",
    tags: ["String", "Stack"],
    testCases: [
      { input: "()", expected_output: "true", is_sample: true },
      { input: "()[]{}", expected_output: "true", is_sample: true },
      { input: "(]", expected_output: "false", is_sample: false }
    ]
  },
  {
    title: "Min Stack",
    description: "Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.\n\nMethods: push, pop, top, getMin.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nMaintain a secondary stack that stores the minimum element corresponding to each state of the primary stack.",
    tags: ["Stack", "Design"],
    testCases: [
      { input: "push(-2) push(0) push(-3) getMin() pop() top() getMin()", expected_output: "-3 0 -2", is_sample: true }
    ]
  },
  {
    title: "Evaluate Reverse Polish Notation",
    description: "Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, and /.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse a stack. Loop through elements. If operand, push to stack. If operator, pop two elements, evaluate, and push result back.",
    tags: ["Array", "Math", "Stack"],
    testCases: [
      { input: "2 1 + 3 *", expected_output: "9", is_sample: true },
      { input: "4 13 5 / +", expected_output: "6", is_sample: true }
    ]
  },
  {
    title: "Generate Parentheses",
    description: "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.\n\nExample:\nInput: n = 3\nOutput: [\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse Backtracking/Recursion. Keep track of open and closed counts. Add open if open < n; add closed if closed < open.",
    tags: ["String", "Dynamic Programming", "Backtracking"],
    testCases: [
      { input: "3", expected_output: "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]", is_sample: true }
    ]
  },
  {
    title: "Daily Temperatures",
    description: "Given an array of integers temperatures represents the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the ith day to get a warmer temperature.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse a monotonic stack storing indices of temperatures. While current temperature is greater than top index temperature, pop and compute day index diffs.",
    tags: ["Array", "Stack", "Monotonic Stack"],
    testCases: [
      { input: "73 74 75 71 69 72 76 73", expected_output: "1 1 4 2 1 1 0 0", is_sample: true }
    ]
  },
  {
    title: "Car Fleet",
    description: "There are n cars at given positions moving towards a destination. Calculate how many fleets (groups of cars arriving together) will form.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nSort cars by position descending. Calculate destination arrival time for each car. Fleet counts increase when a trailing car arrives slower.",
    tags: ["Array", "Stack", "Sorting", "Monotonic Stack"],
    testCases: [
      { input: "12\n10 8 0 5 3\n2 4 1 1 3", expected_output: "3", is_sample: true }
    ]
  },
  {
    title: "Largest Rectangle in Histogram",
    description: "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse a monotonic increasing stack storing pairs of (index, height). Pop when encountering smaller heights, computing rectangles area limits.",
    tags: ["Array", "Stack", "Monotonic Stack"],
    testCases: [
      { input: "2 1 5 6 2 3", expected_output: "10", is_sample: true }
    ]
  },
  {
    title: "Implement Queue using Stacks",
    description: "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support push, pop, peek, and empty.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse two stacks: input stack and output stack. Push to input. Pop from output; if output empty, move all from input to output.",
    tags: ["Stack", "Design", "Queue"],
    testCases: [
      { input: "push(1) push(2) peek() pop() empty()", expected_output: "1 1 false", is_sample: true }
    ]
  },
  {
    title: "Simplify Path",
    description: "Given an absolute path for a Unix-style file system, simplify it to the canonical path.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nSplit path by '/'. Iterate components: push directories to stack, pop for '..', skip for '.' or empty strings. Rebuild path.",
    tags: ["String", "Stack"],
    testCases: [
      { input: "/home/", expected_output: "/home", is_sample: true },
      { input: "/../", expected_output: "/", is_sample: true }
    ]
  },
  {
    title: "Asteroid Collision",
    description: "We are given an array asteroids of integers representing asteroids in a row. Return the state of the asteroids after all collisions.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse stack. Push moving right (positive). When moving left (negative), resolve collisions on top of stack by comparing absolute sizes.",
    tags: ["Array", "Stack"],
    testCases: [
      { input: "5 10 -5", expected_output: "5 10", is_sample: true },
      { input: "8 -8", expected_output: "", is_sample: true }
    ]
  },

  // ─── 5. BINARY SEARCH (10 Questions) ───
  {
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.\n\nExample:\nInput: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nSet left = 0, right = end. Compute mid. Shift pointers according to sorted conditions.\n\n### Complexity\n- **Time:** O(log N)\n- **Space:** O(1)",
    tags: ["Array", "Binary Search"],
    testCases: [
      { input: "-1 0 3 5 9 12\n9", expected_output: "4", is_sample: true },
      { input: "-1 0 3 5 9 12\n2", expected_output: "-1", is_sample: true }
    ]
  },
  {
    title: "Search a 2D Matrix",
    description: "Write an efficient algorithm that searches for a value target in an m x n integer matrix. This matrix has rows sorted left-to-right and first integer of row is greater than last of previous.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nTreat the 2D matrix as a flat virtual 1D array. Perform standard binary search, transforming indices: `row = index / columns`, `col = index % columns`.",
    tags: ["Array", "Binary Search", "Matrix"],
    testCases: [
      { input: "1 3 5 7\n10 11 16 20\n23 30 34 60\n3", expected_output: "true", is_sample: true }
    ]
  },
  {
    title: "Koko Eating Bananas",
    description: "Koko loves to eat bananas. There are n piles of bananas. Return the minimum integer k such that she can eat all the bananas within h hours.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nBinary search the answer space for speed k. The range is `[1, max(piles)]`. For each speed, calculate hours needed and binary search lower bounds.",
    tags: ["Array", "Binary Search"],
    testCases: [
      { input: "3 6 7 11\n8", expected_output: "4", is_sample: true }
    ]
  },
  {
    title: "Find Minimum in Rotated Sorted Array",
    description: "Suppose an array of length n sorted in ascending order is rotated between 1 and n times. Find the minimum element in this array.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse binary search. Compare mid element with right boundary. If `nums[mid] > nums[right]`, min lies on the right. Else min lies on left (including mid).",
    tags: ["Array", "Binary Search"],
    testCases: [
      { input: "3 4 5 1 2", expected_output: "1", is_sample: true }
    ]
  },
  {
    title: "Search in Rotated Sorted Array",
    description: "Given the array nums after rotation, and an integer target, return the index of target if it is in nums, or -1 if it is not.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nIn binary search, at least one half of the rotated array is always strictly sorted. Identify which half is sorted and adjust bounds.",
    tags: ["Array", "Binary Search"],
    testCases: [
      { input: "4 5 6 7 0 1 2\n0", expected_output: "4", is_sample: true }
    ]
  },
  {
    title: "Time Based Key-Value Store",
    description: "Design a time-based key-value data structure that can store multiple values for the same key at different time stamps and retrieve the key's value at a certain timestamp.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nStore values inside a hash map mapping keys to lists of (value, timestamp) pairs. Binary search the list to find the largest timestamp <= target.",
    tags: ["Hash Table", "String", "Binary Search", "Design"],
    testCases: [
      { input: "set(\"foo\",\"bar\",1) get(\"foo\",1) get(\"foo\",3) set(\"foo\",\"bar2\",4) get(\"foo\",4)", expected_output: "bar bar bar2", is_sample: true }
    ]
  },
  {
    title: "First Bad Version",
    description: "You are a product manager and currently leading a team to develop a new product. Find the first bad version that causes all subsequent versions to be bad.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nBinary search search space `[1, n]`. Call `isBadVersion(mid)`. If true, bad starts at or before mid, shrink right bound. Else search right.",
    tags: ["Binary Search", "Interactive"],
    testCases: [
      { input: "5\n4", expected_output: "4", is_sample: true }
    ]
  },
  {
    title: "Search Insert Position",
    description: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nStandard binary search. If target not found, left pointer points to the correct insert position index upon binary exit loop.",
    tags: ["Array", "Binary Search"],
    testCases: [
      { input: "1 3 5 6\n5", expected_output: "2", is_sample: true },
      { input: "1 3 5 6\n2", expected_output: "1", is_sample: true }
    ]
  },
  {
    title: "Peak Index in a Mountain Array",
    description: "An array arr is a mountain array if it strictly increases to peak and then strictly decreases. Return the peak index.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse binary search. Compare `arr[mid]` with `arr[mid+1]`. If `arr[mid] < arr[mid+1]`, peak is on the right, else peak is left.",
    tags: ["Array", "Binary Search"],
    testCases: [
      { input: "0 1 0", expected_output: "1", is_sample: true },
      { input: "0 2 1 0", expected_output: "1", is_sample: true }
    ]
  },
  {
    title: "Find First and Last Position of Element in Sorted Array",
    description: "Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nPerform two binary searches: one searching for target's left boundary index, and one searching for target's right boundary index.",
    tags: ["Array", "Binary Search"],
    testCases: [
      { input: "5 7 7 8 8 10\n8", expected_output: "3 4", is_sample: true }
    ]
  },

  // ─── 6. LINKED LIST (10 Questions) ───
  {
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.\n\nExample:\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse three pointers: prev, curr, and next. In a loop, point curr.next to prev, then advance prev and curr forward.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(1)",
    tags: ["Linked List", "Recursion"],
    testCases: [
      { input: "1 2 3 4 5", expected_output: "5 4 3 2 1", is_sample: true },
      { input: "1 2", expected_output: "2 1", is_sample: true }
    ]
  },
  {
    title: "Merge Two Sorted Lists",
    description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse a dummy node to start the merged list. Iterate through lists with pointers, appending smaller value node and advancing that list pointer.",
    tags: ["Linked List", "Recursion"],
    testCases: [
      { input: "1 2 4\n1 3 4", expected_output: "1 1 2 3 4 4", is_sample: true }
    ]
  },
  {
    title: "Reorder List",
    description: "You are given the head of a singly linked list. Reorder the list in layout L0 → Ln → L1 → Ln-1 → L2 → Ln-2 ...",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\n1. Find mid of linked list using fast/slow pointers.\n2. Reverse second half.\n3. Merge both halves by alternate nodes.",
    tags: ["Two Pointers", "Linked List", "Stack"],
    testCases: [
      { input: "1 2 3 4", expected_output: "1 4 2 3", is_sample: true }
    ]
  },
  {
    title: "Remove Nth Node From End of List",
    description: "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse two pointers. Position right pointer `n` steps ahead of left pointer. Advance both together; when right hits end, left points to target parent.",
    tags: ["Linked List", "Two Pointers"],
    testCases: [
      { input: "1 2 3 4 5\n2", expected_output: "1 2 3 5", is_sample: true }
    ]
  },
  {
    title: "Copy List with Random Pointer",
    description: "A linked list of length n is given such that each node contains an additional random pointer. Construct a deep copy of the list.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nIterate through list, copying nodes and inserting copy next to original node. Then copy random pointers. Finally separate nodes.",
    tags: ["Hash Table", "Linked List"],
    testCases: [
      { input: "[[7,null],[13,0],[11,4],[10,2],[1,0]]", expected_output: "[[7,null],[13,0],[11,4],[10,2],[1,0]]", is_sample: true }
    ]
  },
  {
    title: "Add Two Numbers",
    description: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order. Add the two numbers and return the sum as a linked list.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nSimulate primary school addition. Loop through lists, adding values and tracking carry. Construct new list with node digit values.",
    tags: ["Linked List", "Math", "Recursion"],
    testCases: [
      { input: "2 4 3\n5 6 4", expected_output: "7 0 8", is_sample: true }
    ]
  },
  {
    title: "Linked List Cycle",
    description: "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nFloyd's Cycle-Finding Algorithm (Tortoise and Hare). Fast moves 2 nodes, slow moves 1. If they meet, a cycle exists.",
    tags: ["Linked List", "Hash Table", "Two Pointers"],
    testCases: [
      { input: "3 2 0 -4\n1", expected_output: "true", is_sample: true }
    ]
  },
  {
    title: "Linked List Cycle II",
    description: "Given the head of a linked list, return the node where the cycle begins. If there is no cycle, return null.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nDetect intersection using tortoise and hare. Reset slow to head; advance both at 1 node speed. They will meet at cycle origin.",
    tags: ["Hash Table", "Linked List", "Two Pointers"],
    testCases: [
      { input: "3 2 0 -4\n1", expected_output: "tail connects to node index 1", is_sample: true }
    ]
  },
  {
    title: "Merge k Sorted Lists",
    description: "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse a min-heap to store the head nodes of each linked-list. Repeatedly pop the minimal node, appending it and pushing its next.",
    tags: ["Linked List", "Divide and Conquer", "Heap", "Merge Sort"],
    testCases: [
      { input: "1 4 5\n1 3 4\n2 6", expected_output: "1 1 2 3 4 4 5 6", is_sample: true }
    ]
  },
  {
    title: "Reverse Nodes in k-Group",
    description: "Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nValidate if k nodes exist. Reverse subsegment of k nodes. Recursively call reverse on remaining list, connecting tail to result.",
    tags: ["Linked List", "Recursion"],
    testCases: [
      { input: "1 2 3 4 5\n2", expected_output: "2 1 4 3 5", is_sample: true }
    ]
  },

  // ─── 7. TREES (10 Questions) ───
  {
    title: "Invert Binary Tree",
    description: "Given the root of a binary tree, invert the tree, and return its root.\n\nExample:\nInput: root = [4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nRecursively swap left and right children for every node in the tree.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(H) (call stack size equals tree height)",
    tags: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    testCases: [
      { input: "4 2 7 1 3 6 9", expected_output: "4 7 2 9 6 3 1", is_sample: true },
      { input: "2 1 3", expected_output: "2 3 1", is_sample: true }
    ]
  },
  {
    title: "Maximum Depth of Binary Tree",
    description: "Given the root of a binary tree, return its maximum depth.\n\nExample:\nInput: root = [3,9,20,null,null,15,7]\nOutput: 3",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse recursion: `maxDepth(root) = 1 + max(maxDepth(left), maxDepth(right))` with base case `0` for null nodes.",
    tags: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    testCases: [
      { input: "3 9 20 null null 15 7", expected_output: "3", is_sample: true }
    ]
  },
  {
    title: "Diameter of Binary Tree",
    description: "Given the root of a binary tree, return the length of the diameter of the tree. The diameter of a binary tree is the length of the longest path between any two nodes in a tree.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nFor each node, compute tree heights. The diameter crossing current node is `leftHeight + rightHeight`. Keep running max tracks.",
    tags: ["Tree", "Depth-First Search", "Binary Tree"],
    testCases: [
      { input: "1 2 3 4 5", expected_output: "3", is_sample: true }
    ]
  },
  {
    title: "Balanced Binary Tree",
    description: "Given a binary tree, determine if it is height-balanced (height difference of left and right subtrees <= 1 for all nodes).",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nRecursively check heights. If any child is unbalanced, return -1. Height calculation fails early if differences > 1.",
    tags: ["Tree", "Depth-First Search", "Binary Tree"],
    testCases: [
      { input: "3 9 20 null null 15 7", expected_output: "true", is_sample: true }
    ]
  },
  {
    title: "Same Tree",
    description: "Given the roots of two binary trees p and q, write a function to check if they are the same or not.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nBase cases: if both null, true; if one null or values differ, false. Recursively check p.left == q.left and p.right == q.right.",
    tags: ["Tree", "Depth-First Search", "Breadth-First Search", "Binary Tree"],
    testCases: [
      { input: "1 2 3\n1 2 3", expected_output: "true", is_sample: true }
    ]
  },
  {
    title: "Subtree of Another Tree",
    description: "Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nFor every node in root, check if it matches subRoot exactly using `isSameTree(node, subRoot)`. Return true if any node matches.",
    tags: ["Tree", "Depth-First Search", "String Matching", "Hash Function", "Binary Tree"],
    testCases: [
      { input: "3 4 5 1 2\n4 1 2", expected_output: "true", is_sample: true }
    ]
  },
  {
    title: "Lowest Common Ancestor of a Binary Search Tree",
    description: "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUtilize BST properties. If both target nodes have values greater than root, LCA lies in right subtree. If smaller, left. Else, root is LCA.",
    tags: ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"],
    testCases: [
      { input: "6 2 8 0 4 7 9 null null 3 5\n2\n8", expected_output: "6", is_sample: true }
    ]
  },
  {
    title: "Kth Smallest Element in a BST",
    description: "Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nIn-order traversal of a BST visits nodes in strictly ascending order. Run an in-order traversal, count nodes, and stop at element k.",
    tags: ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"],
    testCases: [
      { input: "3 1 4 null 2\n1", expected_output: "1", is_sample: true }
    ]
  },
  {
    title: "Validate Binary Search Tree",
    description: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nRecursively pass minimum and maximum value bounds allowed for each subtree. Validate that every node fits strictly inside constraints.",
    tags: ["Tree", "Depth-First Search", "Binary Search Tree", "Binary Tree"],
    testCases: [
      { input: "2 1 3", expected_output: "true", is_sample: true },
      { input: "5 1 4 null null 3 6", expected_output: "false", is_sample: true }
    ]
  },
  {
    title: "Binary Tree Maximum Path Sum",
    description: "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes has an edge connecting them. Return the maximum path sum of any non-empty path.",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nFor each node, compute maximum single branch contribution. Running sum tracks path sums through root node: `node.val + leftBranch + rightBranch`.",
    tags: ["Tree", "Depth-First Search", "Dynamic Programming", "Binary Tree"],
    testCases: [
      { input: "-10 9 20 null null 15 7", expected_output: "42", is_sample: true }
    ]
  },

  // ─── 8. GRAPHS (10 Questions) ───
  {
    title: "Number of Islands",
    description: "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nExample:\nInput: grid = [\n  [\"1\",\"1\",\"1\",\"1\",\"0\"],\n  [\"1\",\"1\",\"0\",\"1\",\"0\"],\n  [\"1\",\"1\",\"0\",\"0\",\"0\"],\n  [\"0\",\"0\",\"0\",\"0\",\"0\"]\n]\nOutput: 1",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nIterate grid cells. When land ('1') is seen, run BFS/DFS to traverse all contiguous land and flip visited land to water ('0').\n\n### Complexity\n- **Time:** O(R * C)\n- **Space:** O(R * C) (call stack size in worst case)",
    tags: ["Array", "Depth-First Search", "Breadth-First Search", "Union Find", "Matrix"],
    testCases: [
      { input: "grid_islands_input_data", expected_output: "1", is_sample: true }
    ]
  },
  {
    title: "Clone Graph",
    description: "Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse a hash map to map original nodes to their cloned counterparts. Run a BFS or DFS to traverse neighbors, creating and connecting copies.",
    tags: ["Hash Table", "Depth-First Search", "Breadth-First Search", "Graph"],
    testCases: [
      { input: "[[2,4],[1,3],[2,4],[1,3]]", expected_output: "[[2,4],[1,3],[2,4],[1,3]]", is_sample: true }
    ]
  },
  {
    title: "Max Area of Island",
    description: "You are given an m x n binary matrix grid. An island is a group of 1's. Return the maximum area of an island in the grid.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse DFS/BFS. Visit cells. When '1' is encountered, trigger DFS search sum, adding land cells and returning cumulative area.",
    tags: ["Array", "Depth-First Search", "Breadth-First Search", "Union Find", "Matrix"],
    testCases: [
      { input: "grid_island_areas_data", expected_output: "6", is_sample: true }
    ]
  },
  {
    title: "Pacific Atlantic Water Flow",
    description: "There is an m x n rectangular island. Find list of grid coordinates where water can flow to both Pacific and Atlantic oceans.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nPerform ocean-inward DFS/BFS traversals. Trace flow pathways upwards from Pacific borders, and then Atlantic borders. Intersects are candidates.",
    tags: ["Array", "Depth-First Search", "Breadth-First Search", "Matrix"],
    testCases: [
      { input: "grid_elevations_data", expected_output: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]", is_sample: true }
    ]
  },
  {
    title: "Course Schedule",
    description: "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given prerequisites. Determine if you can finish all courses.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nThis is a cycle detection challenge in a directed graph. Use DFS graph coloring (visiting, visited) or topological sorting (Kahn's in-degree).",
    tags: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"],
    testCases: [
      { input: "2\n[[1,0]]", expected_output: "true", is_sample: true },
      { input: "2\n[[1,0],[0,1]]", expected_output: "false", is_sample: true }
    ]
  },
  {
    title: "Course Schedule II",
    description: "Given prerequisites courses relations, return the ordering of courses you should take to finish all courses. If impossible, return empty array.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nImplement Kahn's algorithm or DFS topological sort. Generate output sequence stack order when course in-degree falls to 0.",
    tags: ["Depth-First Search", "Breadth-First Search", "Graph", "Topological Sort"],
    testCases: [
      { input: "4\n[[1,0],[2,0],[3,1],[3,2]]", expected_output: "0 1 2 3", is_sample: true }
    ]
  },
  {
    title: "Rotting Oranges",
    description: "You are given an m x n grid where each cell represents an orange (empty, fresh, rotten). Return the minimum minutes elapsed until all fresh oranges rot.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nMulti-source BFS. Put all rotten oranges ('2') in queue. Expand outward level by level (minute count). Keep track of fresh count.",
    tags: ["Array", "Breadth-First Search", "Matrix"],
    testCases: [
      { input: "2 1 1\n1 1 0\n0 1 1", expected_output: "4", is_sample: true }
    ]
  },
  {
    title: "Number of Connected Components in an Undirected Graph",
    description: "Given n nodes and undirected edges, find the number of connected components in the graph.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse Union-Find data structure. Start with `n` components. For each edge, union the two nodes. Decrement component count upon successful union.",
    tags: ["Depth-First Search", "Breadth-First Search", "Union Find", "Graph"],
    testCases: [
      { input: "5\n[[0,1],[1,2],[3,4]]", expected_output: "2", is_sample: true }
    ]
  },
  {
    title: "Graph Valid Tree",
    description: "Given n nodes and list of undirected edges, determine if these edges make a valid tree.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nA valid tree has exactly `n - 1` edges and no cycles (all nodes connected). Verify edge count, then run DFS/BFS to trace reachability.",
    tags: ["Depth-First Search", "Breadth-First Search", "Union Find", "Graph"],
    testCases: [
      { input: "5\n[[0,1],[0,2],[0,3],[1,4]]", expected_output: "true", is_sample: true }
    ]
  },
  {
    title: "Redundant Connection",
    description: "In this problem, a tree is an undirected graph that is connected and has no cycles. Return an edge that can be removed so that the resulting graph is a tree.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nIterate through edges using Union-Find. If the two nodes of an edge are already connected in the same set, that edge creates a cycle and is redundant.",
    tags: ["Depth-First Search", "Breadth-First Search", "Union Find", "Graph"],
    testCases: [
      { input: "[[1,2],[1,3],[2,3]]", expected_output: "2 3", is_sample: true }
    ]
  },

  // ─── 9. DYNAMIC PROGRAMMING (10 Questions) ───
  {
    title: "Climbing Stairs",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?\n\nExample:\nInput: n = 2\nOutput: 2",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nThis is Fibonacci sequence problem. `ways(n) = ways(n-1) + ways(n-2)`. Space can be optimized to O(1).\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(1)",
    tags: ["Math", "Dynamic Programming", "Memoization"],
    testCases: [
      { input: "2", expected_output: "2", is_sample: true },
      { input: "3", expected_output: "3", is_sample: true },
      { input: "5", expected_output: "8", is_sample: false }
    ]
  },
  {
    title: "Min Cost Climbing Stairs",
    description: "You are given an integer array cost where cost[i] is the cost of ith step on a staircase. Return the minimum cost to reach the top.",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nIterate stairs bottom-up. For step `i`, `minCost[i] = cost[i] + min(minCost[i-1], minCost[i-2])`. Keep rolling parameters.",
    tags: ["Array", "Dynamic Programming"],
    testCases: [
      { input: "10 15 20", expected_output: "15", is_sample: true }
    ]
  },
  {
    title: "House Robber",
    description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Return the max money you can rob.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nFor each house, choose max profit: rob current house + two houses back, or skip current house and take previous house maximum.",
    tags: ["Array", "Dynamic Programming"],
    testCases: [
      { input: "1 2 3 1", expected_output: "4", is_sample: true }
    ]
  },
  {
    title: "House Robber II",
    description: "All houses at this place are arranged in a circle. That means the first house is the neighbor of the last one. Return the max money you can rob.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nSince first and last houses are connected, they cannot both be robbed. Run standard House Robber twice: once on `[0, n-2]` and once on `[1, n-1]`.",
    tags: ["Array", "Dynamic Programming"],
    testCases: [
      { input: "2 3 2", expected_output: "3", is_sample: true }
    ]
  },
  {
    title: "Longest Palindromic Substring",
    description: "Given a string s, return the longest palindromic substring in s.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nIterate through string. Treat each index (and pair indices) as center of a potential palindrome. Expand outward matching bounds.",
    tags: ["String", "Dynamic Programming"],
    testCases: [
      { input: "babad", expected_output: "bab", is_sample: true }
    ]
  },
  {
    title: "Palindromic Substrings",
    description: "Given a string s, return the number of palindromic substrings in it.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse center expansion technique. For each center index (both odd and even sizes), expand outward and count valid palindromes.",
    tags: ["String", "Dynamic Programming"],
    testCases: [
      { input: "abc", expected_output: "3", is_sample: true },
      { input: "aaa", expected_output: "6", is_sample: true }
    ]
  },
  {
    title: "Decode Ways",
    description: "A message containing letters from A-Z can be encoded into numbers. Given a string s containing only digits, return the number of ways to decode it.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse dynamic programming. For index `i`, check single-digit decoding viability, and double-digit decoding compatibility. Sum solutions.",
    tags: ["String", "Dynamic Programming"],
    testCases: [
      { input: "12", expected_output: "2", is_sample: true },
      { input: "226", expected_output: "3", is_sample: true }
    ]
  },
  {
    title: "Coin Change",
    description: "You are given an integer array coins representing coins of different denominations and an integer amount. Return the fewest coins needed to make up that amount.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nDynamic programming bottom-up. Create array `dp` of size `amount + 1` filled with `infinity`. `dp[i] = min(dp[i], 1 + dp[i - coin])` for each coin.",
    tags: ["Array", "Dynamic Programming", "Breadth-First Search"],
    testCases: [
      { input: "1 2 5\n11", expected_output: "3", is_sample: true },
      { input: "2\n3", expected_output: "-1", is_sample: true }
    ]
  },
  {
    title: "Maximum Subarray",
    description: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nKadane's algorithm. Iterate numbers. Keep tracking current sum: `currentSum = max(num, currentSum + num)`. Keep tracks of max sum seen.",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    testCases: [
      { input: "-2 1 -3 4 -1 2 1 -5 4", expected_output: "6", is_sample: true }
    ]
  },
  {
    title: "Jump Game",
    description: "You are given an integer array nums. You are initially positioned at the first index. Determine if you are able to reach the last index.",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nGreedy approach. Iterate backwards from end index, tracking the goal index. If current index can reach goal, shift goal to current index.",
    tags: ["Array", "Dynamic Programming", "Greedy"],
    testCases: [
      { input: "2 3 1 1 4", expected_output: "true", is_sample: true },
      { input: "3 2 1 0 4", expected_output: "false", is_sample: true }
    ]
  },
  // ─── 10. ADDITIONAL PROBLEMS (50 Questions) ───
  // Easy Questions (17)
  {
    title: "Fizz Buzz",
    description: "Given an integer n, return a string array answer (1-indexed) where:\n- answer[i] == 'FizzBuzz' if i is divisible by 3 and 5.\n- answer[i] == 'Fizz' if i is divisible by 3.\n- answer[i] == 'Buzz' if i is divisible by 5.\n- answer[i] == i (as a string) if none of the above conditions are true.\n\nExample:\nInput: n = 3\nOutput: [\"1\",\"2\",\"Fizz\"]",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nIterate from 1 to n. For each number, check divisibility by 3 and 5, 3 only, 5 only, or none. Append the appropriate string to the output list.",
    tags: ["Math", "String", "Simulation"],
    testCases: [
      { input: "3", expected_output: "1 2 Fizz", is_sample: true },
      { input: "5", expected_output: "1 2 Fizz 4 Buzz", is_sample: true },
      { input: "15", expected_output: "1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz", is_sample: false }
    ]
  },
  {
    title: "Reverse Vowels of a String",
    description: "Given a string s, reverse only all the vowels in the string and return it.\nThe vowels are 'a', 'e', 'i', 'o', and 'u', and they can appear in both lower and upper cases.\n\nExample:\nInput: s = \"hello\"\nOutput: \"holle\"",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse two pointers, one starting at the beginning and the other at the end. Move them towards each other until both point to vowels, then swap them and repeat.",
    tags: ["Two Pointers", "String"],
    testCases: [
      { input: "hello", expected_output: "holle", is_sample: true },
      { input: "leetcode", expected_output: "leotcede", is_sample: true }
    ]
  },
  {
    title: "Power of Two",
    description: "Given an integer n, return true if it is a power of two. Otherwise, return false.\nAn integer n is a power of two, if there exists an integer x such that n == 2^x.\n\nExample:\nInput: n = 16\nOutput: true",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nA power of two has exactly one set bit in binary. We can check this using bitwise AND: n > 0 && (n & (n - 1)) == 0.",
    tags: ["Math", "Bit Manipulation"],
    testCases: [
      { input: "1", expected_output: "true", is_sample: true },
      { input: "16", expected_output: "true", is_sample: true },
      { input: "3", expected_output: "false", is_sample: false }
    ]
  },
  {
    title: "Length of Last Word",
    description: "Given a string s consisting of words and spaces, return the length of the last word in the string.\nA word is a maximal substring consisting of non-space characters only.\n\nExample:\nInput: s = \"Hello World\"\nOutput: 5",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nStart scanning the string from the end. Skip any trailing spaces, then count characters until a space or the start of the string is encountered.",
    tags: ["String"],
    testCases: [
      { input: "Hello World", expected_output: "5", is_sample: true },
      { input: "   fly me   to   the moon  ", expected_output: "4", is_sample: true }
    ]
  },
  {
    title: "Valid Perfect Square",
    description: "Given a positive integer num, return true if num is a perfect square, or false otherwise.\nYou must not use any built-in library function, such as sqrt.\n\nExample:\nInput: num = 16\nOutput: true",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse binary search in the range [1, num]. For each candidate mid, check if mid * mid == num.",
    tags: ["Math", "Binary Search"],
    testCases: [
      { input: "16", expected_output: "true", is_sample: true },
      { input: "14", expected_output: "false", is_sample: true }
    ]
  },
  {
    title: "Find the Difference",
    description: "You are given two strings s and t. String t is generated by random shuffling string s and then adding one more letter at a random position. Return the letter that was added to t.\n\nExample:\nInput: s = \"abcd\", t = \"abcde\"\nOutput: \"e\"",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nWe can sum the ASCII values of all characters in s and t. The difference between the two sums will be the ASCII value of the added character.",
    tags: ["Hash Table", "String", "Bit Manipulation"],
    testCases: [
      { input: "abcd\nabcde", expected_output: "e", is_sample: true },
      { input: "\ny", expected_output: "y", is_sample: true }
    ]
  },
  {
    title: "First Unique Character in a String",
    description: "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.\n\nExample:\nInput: s = \"leetcode\"\nOutput: 0",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nCount the frequency of each character in s using a hash map or array. Then, iterate through the string again to find the first character with a frequency of 1.",
    tags: ["Hash Table", "String", "Queue"],
    testCases: [
      { input: "leetcode", expected_output: "0", is_sample: true },
      { input: "loveleetcode", expected_output: "2", is_sample: true },
      { input: "aabb", expected_output: "-1", is_sample: false }
    ]
  },
  {
    title: "Intersection of Two Arrays II",
    description: "Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays and you may return the result in any order.\n\nExample:\nInput: nums1 = [1,2,2,1], nums2 = [2,2]\nOutput: [2,2]",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse a hash map to count the occurrences of each element in nums1. Then iterate through nums2, and if an element is in the hash map with a count > 0, add it to the result and decrement the count.",
    tags: ["Array", "Hash Table", "Two Pointers", "Sorting"],
    testCases: [
      { input: "1 2 2 1\n2 2", expected_output: "2 2", is_sample: true },
      { input: "4 9 5\n9 4 9 8 4", expected_output: "4 9", is_sample: true }
    ]
  },
  {
    title: "Keyboard Row",
    description: "Given an array of strings words, return the words that can be typed using letters of alphabet on only one row of American keyboard.\n- Row 1: qwertyuiop\n- Row 2: asdfghjkl\n- Row 3: zxcvbnm\n\nExample:\nInput: words = [\"Hello\",\"Alaska\",\"Dad\",\"Peace\"]\nOutput: [\"Alaska\",\"Dad\"]",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nCreate sets of characters representing each row of the keyboard. For each word, check if all of its characters belong to the same set.",
    tags: ["Array", "Hash Table", "String"],
    testCases: [
      { input: "Hello Alaska Dad Peace", expected_output: "Alaska Dad", is_sample: true },
      { input: "omk", expected_output: "", is_sample: true }
    ]
  },
  {
    title: "Ransom Note",
    description: "Given two strings ransomNote and magazine, return true if ransomNote can be constructed by representing letters from magazine and false otherwise. Each letter in magazine can only be used once in ransomNote.\n\nExample:\nInput: ransomNote = \"a\", magazine = \"b\"\nOutput: false",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nCount the frequency of each character in magazine. Then, iterate through ransomNote and decrement the counts. If any count drops below 0, return false.",
    tags: ["Hash Table", "String", "Counting"],
    testCases: [
      { input: "a\nb", expected_output: "false", is_sample: true },
      { input: "aa\nab", expected_output: "false", is_sample: true },
      { input: "aa\naab", expected_output: "true", is_sample: false }
    ]
  },
  {
    title: "Detect Capital",
    description: "We define the usage of capitals in a word to be right when one of the following cases holds:\n1. All letters in this word are capitals, like 'USA'.\n2. All letters in this word are not capitals, like 'leetcode'.\n3. Only the first letter in this word is capital, like 'Google'.\nGiven a string word, return true if the usage of capitals in it is right.\n\nExample:\nInput: word = \"USA\"\nOutput: true",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nCheck the number of uppercase letters. If all are uppercase, or none are uppercase, or only the first is uppercase (and length > 0), return true.",
    tags: ["String"],
    testCases: [
      { input: "USA", expected_output: "true", is_sample: true },
      { input: "FlaG", expected_output: "false", is_sample: true }
    ]
  },
  {
    title: "Single Number",
    description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\nYou must implement a solution with a linear runtime complexity and use only constant extra space.\n\nExample:\nInput: nums = [2,2,1]\nOutput: 1",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nUse the bitwise XOR operator. Since A ^ A = 0 and A ^ 0 = A, XORing all elements together will cancel out the duplicates and leave the single number.",
    tags: ["Array", "Bit Manipulation"],
    testCases: [
      { input: "2 2 1", expected_output: "1", is_sample: true },
      { input: "4 1 2 1 2", expected_output: "4", is_sample: true }
    ]
  },
  {
    title: "Fibonacci Number",
    description: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\nF(0) = 0, F(1) = 1\nF(n) = F(n - 1) + F(n - 2), for n > 1.\nGiven n, calculate F(n).\n\nExample:\nInput: n = 2\nOutput: 1",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nCompute the numbers iteratively using two variables to keep track of the previous two numbers, achieving O(N) time and O(1) space.",
    tags: ["Math", "Dynamic Programming", "Recursion"],
    testCases: [
      { input: "2", expected_output: "1", is_sample: true },
      { input: "3", expected_output: "2", is_sample: true },
      { input: "4", expected_output: "3", is_sample: false }
    ]
  },
  {
    title: "Defanging an IP Address",
    description: "Given a valid (IPv4) IP address, return a defanged version of that IP address.\nA defanged IP address replaces every period '.' with '[.]'.\n\nExample:\nInput: address = \"1.1.1.1\"\nOutput: \"1[.]1[.]1[.]1\"",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nIterate through the string and replace each '.' character with '[.]', or use a built-in string replacement method.",
    tags: ["String"],
    testCases: [
      { input: "1.1.1.1", expected_output: "1[.]1[.]1[.]1", is_sample: true },
      { input: "255.100.50.0", expected_output: "255[.]100[.]50[.]0", is_sample: true }
    ]
  },
  {
    title: "Jewels and Stones",
    description: "You're given strings jewels representing the types of stones that are jewels, and stones representing the stones you have. Each character in stones is a type of stone you have. You want to know how many of the stones you have are also jewels.\n\nExample:\nInput: jewels = \"aA\", stones = \"aAAbbbb\"\nOutput: 3",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nStore the characters of jewels in a hash set. Iterate through stones and check if each stone is in the jewel set, incrementing a counter if it is.",
    tags: ["Hash Table", "String"],
    testCases: [
      { input: "aA\naAAbbbb", expected_output: "3", is_sample: true },
      { input: "z\nZZ", expected_output: "0", is_sample: true }
    ]
  },
  {
    title: "Running Sum of 1d Array",
    description: "Given an array nums. We define a running sum of an array as runningSum[i] = sum(nums[0]…nums[i]).\nReturn the running sum of nums.\n\nExample:\nInput: nums = [1,2,3,4]\nOutput: [1,3,6,10]",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nIterate through the array starting from index 1. Update each element nums[i] = nums[i] + nums[i-1].",
    tags: ["Array", "Prefix Sum"],
    testCases: [
      { input: "1 2 3 4", expected_output: "1 3 6 10", is_sample: true },
      { input: "1 1 1 1 1", expected_output: "1 2 3 4 5", is_sample: true }
    ]
  },
  {
    title: "Divisor Game",
    description: "Alice and Bob take turns playing a game, with Alice starting first. Initially, there is a number n on the chalkboard. On each player's turn, that player makes a move consisting of choosing any x with 0 < x < n and n % x == 0, then replacing n with n - x. If a player cannot make a move, they lose.\nReturn true if Alice wins, assuming both play optimally.\n\nExample:\nInput: n = 2\nOutput: true",
    difficulty: "EASY",
    max_score: 100,
    editorial: "### Intuition\nAlice will always win if n is even, because she can always choose x = 1 and hand Bob an odd number. Bob is forced to hand back an even number. If n is odd, Bob wins.",
    tags: ["Math", "Dynamic Programming", "Game Theory"],
    testCases: [
      { input: "2", expected_output: "true", is_sample: true },
      { input: "3", expected_output: "false", is_sample: true }
    ]
  },

  // Medium Questions (17)
  {
    title: "Integer to Roman",
    description: "Given an integer, convert it to a roman numeral. Input is guaranteed to be within the range 1 to 3999.\n\nExample:\nInput: num = 3749\nOutput: \"MMDCCXLIX\"",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nStore roman symbols and values in descending order. Repeatedly subtract the largest possible values and append the corresponding symbols.",
    tags: ["Hash Table", "Math", "String"],
    testCases: [
      { input: "3749", expected_output: "MMDCCXLIX", is_sample: true },
      { input: "58", expected_output: "LVIII", is_sample: true },
      { input: "1994", expected_output: "MCMXCIV", is_sample: false }
    ]
  },
  {
    title: "String to Integer (atoi)",
    description: "Implement the myAtoi(string s) function, which converts a string to a 32-bit signed integer.\n\nExample:\nInput: s = \"   -42\"\nOutput: -42",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse state variables to handle whitespace, sign, digit accumulation, and overflow detection using 32-bit limits.",
    tags: ["String"],
    testCases: [
      { input: "42", expected_output: "42", is_sample: true },
      { input: " -042", expected_output: "-42", is_sample: true },
      { input: "1337c0d3", expected_output: "1337", is_sample: false }
    ]
  },
  {
    title: "3Sum Closest",
    description: "Given an integer array nums of length n and an integer target, find three integers in nums such that the sum is closest to target. Return the sum of the three integers.\n\nExample:\nInput: nums = [-1,2,1,-4], target = 1\nOutput: 2",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nSort the array and iterate through it. For each element, use a two-pointer approach to find the closest sum to the target, keeping track of the minimum absolute difference.",
    tags: ["Array", "Two Pointers", "Sorting"],
    testCases: [
      { input: "-1 2 1 -4\n1", expected_output: "2", is_sample: true },
      { input: "0 0 0\n1", expected_output: "0", is_sample: true }
    ]
  },
  {
    title: "Letter Combinations of a Phone Number",
    description: "Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent. Return the answer in any order.\n\nExample:\nInput: digits = \"23\"\nOutput: [\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse backtracking or standard breadth-first queue expansion to generate all possible combinations iteratively by appending letters of the current digit to existing prefixes.",
    tags: ["Hash Table", "String", "Backtracking"],
    testCases: [
      { input: "23", expected_output: "ad ae af bd be bf cd ce cf", is_sample: true },
      { input: "", expected_output: "", is_sample: true }
    ]
  },
  {
    title: "Divide Two Integers",
    description: "Given two integers dividend and divisor, divide two integers without using multiplication, division, and mod operator. Return the quotient.\n\nExample:\nInput: dividend = 10, divisor = 3\nOutput: 3",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse bit shifting to double the divisor repeatedly until it exceeds the remaining dividend, subtracting the largest shifted values and adding the corresponding powers of 2 to the quotient.",
    tags: ["Math", "Bit Manipulation"],
    testCases: [
      { input: "10\n3", expected_output: "3", is_sample: true },
      { input: "7\n-3", expected_output: "-2", is_sample: true }
    ]
  },
  {
    title: "Next Permutation",
    description: "Given an array of integers nums, find the next lexicographically greater permutation of nums. If such arrangement is not possible, the array must be rearranged as the lowest possible order.\n\nExample:\nInput: nums = [1,2,3]\nOutput: [1,3,2]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nFind the first decreasing element from the right. Swap it with the next larger element on its right, then reverse the sequence to the right of the swap index.",
    tags: ["Array", "Two Pointers"],
    testCases: [
      { input: "1 2 3", expected_output: "1 3 2", is_sample: true },
      { input: "3 2 1", expected_output: "1 2 3", is_sample: true },
      { input: "1 1 5", expected_output: "1 5 1", is_sample: false }
    ]
  },
  {
    title: "Multiply Strings",
    description: "Given two non-negative integers num1 and num2 represented as strings, return the product of num1 and num2, also represented as a string.\n\nExample:\nInput: num1 = \"2\", num2 = \"3\"\nOutput: \"6\"",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nSimulate multiplication by creating a result array of size num1.length + num2.length. Multiply digits from right to left, accumulate values and handle carries.",
    tags: ["Math", "String", "Simulation"],
    testCases: [
      { input: "2\n3", expected_output: "6", is_sample: true },
      { input: "123\n456", expected_output: "56088", is_sample: true }
    ]
  },
  {
    title: "Rotate Image",
    description: "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise) in-place.\n\nExample:\nInput: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [[7,4,1],[8,5,2],[9,6,3]]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nFirst, transpose the matrix (swap matrix[i][j] with matrix[j][i]). Then, reverse each row of the matrix.",
    tags: ["Array", "Math", "Matrix"],
    testCases: [
      { input: "1 2 3\n4 5 6\n7 8 9", expected_output: "7 4 1\n8 5 2\n9 6 3", is_sample: true },
      { input: "5 1 9 11\n2 4 8 10\n13 3 6 7\n15 14 12 16", expected_output: "15 13 2 5\n14 3 4 1\n12 6 8 9\n16 7 10 11", is_sample: true }
    ]
  },
  {
    title: "Spiral Matrix",
    description: "Given an m x n matrix, return all elements of the matrix in spiral order.\n\nExample:\nInput: matrix = [[1,2,3],[4,5,6],[7,8,9]]\nOutput: [1,2,3,6,9,8,7,4,5]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nMaintain four boundaries (top, bottom, left, right). Traverse from left to right, top to bottom, right to left, and bottom to top, updating boundaries iteratively.",
    tags: ["Array", "Matrix", "Simulation"],
    testCases: [
      { input: "1 2 3\n4 5 6\n7 8 9", expected_output: "1 2 3 6 9 8 7 4 5", is_sample: true },
      { input: "1 2 3 4\n5 6 7 8\n9 10 11 12", expected_output: "1 2 3 4 8 12 11 10 9 5 6 7", is_sample: true }
    ]
  },
  {
    title: "Subsets",
    description: "Given an integer array nums of unique elements, return all possible subsets (the power set).\n\nExample:\nInput: nums = [1,2,3]\nOutput: [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse backtracking or cascading. Start with an empty subset. For each element in nums, append it to all existing subsets to generate new ones.",
    tags: ["Array", "Backtracking", "Bit Manipulation"],
    testCases: [
      { input: "1 2 3", expected_output: "[] [1] [2] [1,2] [3] [1,3] [2,3] [1,2,3]", is_sample: true },
      { input: "0", expected_output: "[] [0]", is_sample: true }
    ]
  },
  {
    title: "Word Search",
    description: "Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells.\n\nExample:\nInput: board = [[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], word = \"ABCCED\"\nOutput: true",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse depth-first search (DFS) with backtracking. For each cell, check if it matches the first letter of the word, then recursively search adjacent cells, marking visited cells temporarily.",
    tags: ["Array", "String", "Backtracking", "Matrix"],
    testCases: [
      { input: "A B C E\nS F C S\nA D E E\nABCCED", expected_output: "true", is_sample: true },
      { input: "A B C E\nS F C S\nA D E E\nSEE", expected_output: "true", is_sample: true },
      { input: "A B C E\nS F C S\nA D E E\nABCB", expected_output: "false", is_sample: false }
    ]
  },
  {
    title: "Longest Common Subsequence",
    description: "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.\n\nExample:\nInput: text1 = \"abcde\", text2 = \"ace\"\nOutput: 3",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nCreate a 2D DP array where dp[i][j] represents the LCS length of text1[0...i-1] and text2[0...j-1]. If characters match, dp[i][j] = 1 + dp[i-1][j-1]; else dp[i][j] = max(dp[i-1][j], dp[i][j-1]).",
    tags: ["String", "Dynamic Programming"],
    testCases: [
      { input: "abcde\nace", expected_output: "3", is_sample: true },
      { input: "abc\nabc", expected_output: "3", is_sample: true },
      { input: "abc\ndef", expected_output: "0", is_sample: false }
    ]
  },
  {
    title: "Unique Paths",
    description: "There is a robot on an m x n grid. The robot is initially located at the top-left corner. The robot tries to move to the bottom-right corner. The robot can only move either down or right at any point in time.\n\nExample:\nInput: m = 3, n = 7\nOutput: 28",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse dynamic programming where dp[i][j] = dp[i-1][j] + dp[i][j-1] with base cases dp[i][0] = 1 and dp[0][j] = 1. This can be optimized to a 1D array of size n.",
    tags: ["Math", "Dynamic Programming", "Combinatorics"],
    testCases: [
      { input: "3 7", expected_output: "28", is_sample: true },
      { input: "3 2", expected_output: "3", is_sample: true }
    ]
  },
  {
    title: "Partition Equal Subset Sum",
    description: "Given an integer array nums, return true if you can partition the array into two subsets such that the sum of the elements in both subsets is equal or false otherwise.\n\nExample:\nInput: nums = [1,5,11,5]\nOutput: true",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nFind the total sum of nums. If it is odd, partition is impossible. If even, solve the 0/1 knapsack subproblem to check if a subset sums to totalSum / 2 using DP.",
    tags: ["Array", "Dynamic Programming"],
    testCases: [
      { input: "1 5 11 5", expected_output: "true", is_sample: true },
      { input: "1 2 3 5", expected_output: "false", is_sample: true }
    ]
  },
  {
    title: "Target Sum",
    description: "You are given an integer array nums and an integer target. Return the number of different expressions that you can build by assigning '+' and '-' signs to each integer in nums that evaluates to target.\n\nExample:\nInput: nums = [1,1,1,1,1], target = 3\nOutput: 5",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nThis problem can be transformed into finding a subset sum. Let the sum of positive elements be P and negative elements be N. We have P - N = target and P + N = totalSum, leading to 2 * P = target + totalSum. Check if (target + totalSum) is even and solve for target sum.",
    tags: ["Array", "Dynamic Programming", "Backtracking"],
    testCases: [
      { input: "1 1 1 1 1\n3", expected_output: "5", is_sample: true },
      { input: "1\n1", expected_output: "1", is_sample: true }
    ]
  },
  {
    title: "Find All Duplicates in an Array",
    description: "Given an integer array nums of length n where all the integers of nums are in the range [1, n] and each integer appears once or twice, return an array of all the integers that appears twice.\n\nExample:\nInput: nums = [4,3,2,7,8,2,3,1]\nOutput: [2,3]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nUse the input array elements as indices. For each element val = abs(nums[i]), negate the value at index val - 1. If the value is already negative, then val is a duplicate.",
    tags: ["Array", "Hash Table"],
    testCases: [
      { input: "4 3 2 7 8 2 3 1", expected_output: "2 3", is_sample: true },
      { input: "1 1 2", expected_output: "1", is_sample: true }
    ]
  },
  {
    title: "Top K Frequent Words",
    description: "Given an array of strings words and an integer k, return the k most frequent strings.\nReturn the answer sorted by the frequency from highest to lowest. Words with the same frequency should be sorted by their lexicographical order.\n\nExample:\nInput: words = [\"i\",\"love\",\"leetcode\",\"i\",\"love\",\"coding\"], k = 2\nOutput: [\"i\",\"love\"]",
    difficulty: "MEDIUM",
    max_score: 200,
    editorial: "### Intuition\nCount word frequencies using a hash map. Insert entries into a min-heap of size k, customized to sort by frequency ascending and then by word descending. Pop and reverse.",
    tags: ["Hash Table", "String", "Sorting", "Heap"],
    testCases: [
      { input: "i love leetcode i love coding\n2", expected_output: "i love", is_sample: true },
      { input: "the day is sunny the the the sunny is is\n4", expected_output: "the is sunny day", is_sample: true }
    ]
  },

  // Hard Questions (16)
  {
    title: "First Missing Positive",
    description: "Given an unsorted integer array nums. Return the smallest positive integer that is not present in nums.\nYou must implement an algorithm that runs in O(n) time and uses O(1) auxiliary space.\n\nExample:\nInput: nums = [1,2,0]\nOutput: 3",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nPlace each number in its correct index position (i.e. nums[i] should go to nums[nums[i] - 1]). Then iterate through the array to find the first index where nums[i] != i + 1.",
    tags: ["Array", "Hash Table"],
    testCases: [
      { input: "1 2 0", expected_output: "3", is_sample: true },
      { input: "3 4 -1 1", expected_output: "2", is_sample: true },
      { input: "7 8 9 11 12", expected_output: "1", is_sample: false }
    ]
  },
  {
    title: "N-Queens",
    description: "The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.\nGiven an integer n, return the number of distinct solutions.\n\nExample:\nInput: n = 4\nOutput: 2",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse backtracking. Place queens row by row. Track columns, positive diagonals (row + col), and negative diagonals (row - col) to check validity in O(1) time.",
    tags: ["Backtracking"],
    testCases: [
      { input: "4", expected_output: "2", is_sample: true },
      { input: "1", expected_output: "1", is_sample: true }
    ]
  },
  {
    title: "Edit Distance",
    description: "Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.\nYou have insertion, deletion, and replacement operations permitted.\n\nExample:\nInput: word1 = \"horse\", word2 = \"ros\"\nOutput: 3",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse dynamic programming where dp[i][j] is the edit distance between word1[0...i-1] and word2[0...j-1]. If word1[i-1] == word2[j-1], dp[i][j] = dp[i-1][j-1]; else dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]).",
    tags: ["String", "Dynamic Programming"],
    testCases: [
      { input: "horse\nros", expected_output: "3", is_sample: true },
      { input: "intention\nexecution", expected_output: "5", is_sample: true }
    ]
  },
  {
    title: "Wildcard Matching",
    description: "Given an input string s and a pattern p, implement wildcard pattern matching with support for '?' and '*' where:\n- '?' Matches any single character.\n- '*' Matches any sequence of characters (including the empty sequence).\n\nExample:\nInput: s = \"aa\", p = \"*\"\nOutput: true",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse dynamic programming where dp[i][j] indicates matching status of s[0...i-1] and p[0...j-1]. A * matches zero characters (dp[i][j-1]) or one/more characters (dp[i-1][j]).",
    tags: ["String", "Dynamic Programming", "Greedy", "Backtracking"],
    testCases: [
      { input: "aa\na", expected_output: "false", is_sample: true },
      { input: "aa\n*", expected_output: "true", is_sample: true },
      { input: "cb\n?a", expected_output: "false", is_sample: false }
    ]
  },
  {
    title: "Maximal Rectangle",
    description: "Given a rows x cols binary matrix filled with 0's and 1's, find the largest rectangle containing only 1's and return its area.\n\nExample:\nInput: matrix = [[\"1\",\"0\",\"1\",\"0\",\"0\"],[\"1\",\"0\",\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\",\"1\",\"1\"],[\"1\",\"0\",\"0\",\"1\",\"0\"]]\nOutput: 6",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nConvert the 2D matrix into a series of histogram problems. For each row, calculate column heights of contiguous 1s, and solve the Largest Rectangle in Histogram using stack.",
    tags: ["Array", "Dynamic Programming", "Stack", "Matrix"],
    testCases: [
      { input: "1 0 1 0 0\n1 0 1 1 1\n1 1 1 1 1\n1 0 0 1 0", expected_output: "6", is_sample: true },
      { input: "0", expected_output: "0", is_sample: true }
    ]
  },
  {
    title: "Reverse Pairs",
    description: "Given an integer array nums, return the number of reverse pairs in the array.\nA reverse pair is a pair (i, j) where 0 <= i < j < nums.length and nums[i] > 2 * nums[j].\n\nExample:\nInput: nums = [1,3,2,3,1]\nOutput: 2",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse Merge Sort. During the merge step, before merging, count the number of valid pairs between the left and right halves in linear time.",
    tags: ["Array", "Binary Search", "Divide and Conquer", "Merge Sort"],
    testCases: [
      { input: "1 3 2 3 1", expected_output: "2", is_sample: true },
      { input: "2 4 3 5 1", expected_output: "3", is_sample: true }
    ]
  },
  {
    title: "Word Ladder",
    description: "Given two words (beginWord and endWord), and a dictionary's word list, find the length of shortest transformation sequence from beginWord to endWord, such that only one letter can be changed at a time and each transformed word must exist in the word list.\n\nExample:\nInput: beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]\nOutput: 5",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse Breadth-First Search (BFS). Put the start word in the queue. For each level, generate all 1-character mutations and check if they exist in the dictionary, tracking visited words.",
    tags: ["Hash Table", "String", "Breadth-First Search"],
    testCases: [
      { input: "hit\ncog\nhot dot dog lot log cog", expected_output: "5", is_sample: true },
      { input: "hit\ncog\nhot dot dog lot log", expected_output: "0", is_sample: true }
    ]
  },
  {
    title: "K-th Smallest in Lexicographical Order",
    description: "Given two integers n and k, return the k-th lexicographically smallest integer in the range [1, n].\n\nExample:\nInput: n = 13, k = 2\nOutput: 10",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse a prefix tree search strategy (denotation of steps). Calculate steps between curr and curr + 1 at each level. If steps <= k, jump to sibling; else go to first child.",
    tags: ["Trie"],
    testCases: [
      { input: "13\n2", expected_output: "10", is_sample: true },
      { input: "1\n1", expected_output: "1", is_sample: true }
    ]
  },
  {
    title: "Maximum Gap",
    description: "Given an unsorted integer array nums, return the maximum difference between successive elements in its sorted form. If the array contains less than two elements, return 0.\nYou must write an algorithm that runs in linear time and uses linear extra space.\n\nExample:\nInput: nums = [3,6,9,1]\nOutput: 3",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse Bucket Sort (Pigeonhole Principle). Determine minimum and maximum values. Put elements into n - 1 buckets of equal size. The maximum gap must occur between elements of different buckets, so track min/max of each bucket.",
    tags: ["Array", "Sorting", "Bucket Sort"],
    testCases: [
      { input: "3 6 9 1", expected_output: "3", is_sample: true },
      { input: "10", expected_output: "0", is_sample: true }
    ]
  },
  {
    title: "Number of Digit One",
    description: "Given an integer n, count the total number of digit 1 appearing in all non-negative integers less than or equal to n.\n\nExample:\nInput: n = 13\nOutput: 6",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nAnalyze digit by digit. For each digit position (ones, tens, hundreds...), compute how many times '1' appears at that position based on the prefix and suffix values.",
    tags: ["Math", "Dynamic Programming"],
    testCases: [
      { input: "13", expected_output: "6", is_sample: true },
      { input: "0", expected_output: "0", is_sample: true }
    ]
  },
  {
    title: "Integer to English Words",
    description: "Convert a non-negative integer num to its English words representation.\n\nExample:\nInput: num = 123\nOutput: \"One Hundred Twenty Three\"",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nGroup the number into chunks of three digits (Billion, Million, Thousand, and remainder). Implement a helper function to convert numbers under 1000 to English words.",
    tags: ["Math", "String", "Recursion"],
    testCases: [
      { input: "123", expected_output: "One Hundred Twenty Three", is_sample: true },
      { input: "12345", expected_output: "Twelve Thousand Three Hundred Forty Five", is_sample: true },
      { input: "1234567", expected_output: "One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven", is_sample: false }
    ]
  },
  {
    title: "Count of Smaller Numbers After Self",
    description: "Given an integer array nums, return an integer array counts where counts[i] is the number of smaller elements to the right of nums[i].\n\nExample:\nInput: nums = [5,2,6,1]\nOutput: [2,1,1,0]",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse Merge Sort or a Binary Indexed Tree (Fenwick Tree). While performing merge sort, track indices and count how many elements from the right half are jumped over during sorting.",
    tags: ["Array", "Binary Search", "Divide and Conquer", "Binary Indexed Tree", "Merge Sort"],
    testCases: [
      { input: "5 2 6 1", expected_output: "2 1 1 0", is_sample: true },
      { input: "-1", expected_output: "0", is_sample: true }
    ]
  },
  {
    title: "Burst Balloons",
    description: "You are given n balloons, indexed from 0 to n - 1. Each balloon is painted with a number on it. Find the maximum coins you can collect by bursting all the balloons optimally.\n\nExample:\nInput: nums = [3,1,5,8]\nOutput: 167",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nUse interval dynamic programming. Let dp[i][j] be the max coins collected in subarray nums[i...j]. Iterate over the balloon k that is burst last in the interval: dp[i][j] = max(dp[i][j], dp[i][k-1] + nums[i-1]*nums[k]*nums[j+1] + dp[k+1][j]).",
    tags: ["Array", "Dynamic Programming"],
    testCases: [
      { input: "3 1 5 8", expected_output: "167", is_sample: true },
      { input: "1 5", expected_output: "10", is_sample: true }
    ]
  },
  {
    title: "Russian Doll Envelopes",
    description: "You are given a 2D array of integers envelopes where envelopes[i] = [wi, hi] represents the width and the height of an envelope. One envelope can fit into another if and only if both the width and height of one envelope are strictly greater than the other envelope's width and height. Return the maximum number of envelopes you can Russian doll.\n\nExample:\nInput: envelopes = [[5,4],[6,4],[6,7],[2,3]]\nOutput: 3",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nSort envelopes by width ascending, and height descending for envelopes with the same width. Then, find the Longest Increasing Subsequence (LIS) on the heights using binary search in O(N log N) time.",
    tags: ["Array", "Binary Search", "Dynamic Programming", "Sorting"],
    testCases: [
      { input: "5 4\n6 4\n6 7\n2 3", expected_output: "3", is_sample: true },
      { input: "1 1\n1 1\n1 1", expected_output: "1", is_sample: true }
    ]
  },
  {
    title: "Split Array Largest Sum",
    description: "Given an integer array nums and an integer k, split nums into k non-empty contiguous subarrays such that the individual largest sum of these subarrays is minimized. Return the minimized largest sum of the split.\n\nExample:\nInput: nums = [7,2,5,10,8], k = 2\nOutput: 18",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nBinary search the answer space. The range is [max(nums), sum(nums)]. For each mid value, check if we can partition the array into at most k subarrays with sums <= mid.",
    tags: ["Array", "Binary Search", "Dynamic Programming", "Greedy"],
    testCases: [
      { input: "7 2 5 10 8\n2", expected_output: "18", is_sample: true },
      { input: "1 2 3 4 5\n2", expected_output: "9", is_sample: true }
    ]
  },
  {
    title: "Valid Number",
    description: "Given a string s, return true if s is a valid number.\n\nExample:\nInput: s = \"0\"\nOutput: true",
    difficulty: "HARD",
    max_score: 300,
    editorial: "### Intuition\nBuild a Deterministic Finite Automaton (DFA) or use a state machine. Loop through characters, shifting states based on whether we see digits, signs, decimal points, exponents, or whitespace.",
    tags: ["String"],
    testCases: [
      { input: "0", expected_output: "true", is_sample: true },
      { input: "e", expected_output: "false", is_sample: true },
      { input: ".e1", expected_output: "false", is_sample: false }
    ]
  }
];

module.exports = { newProblems };
