const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Generate dates relative to NOW so contests are always valid
const now = new Date();
const daysAgo = (d) => { const dt = new Date(now); dt.setDate(dt.getDate() - d); return dt.toISOString().slice(0, 19).replace('T', ' '); };
const daysFromNow = (d) => { const dt = new Date(now); dt.setDate(dt.getDate() + d); return dt.toISOString().slice(0, 19).replace('T', ' '); };
const hoursAgo = (h) => { const dt = new Date(now); dt.setHours(dt.getHours() - h); return dt.toISOString().slice(0, 19).replace('T', ' '); };
const hoursFromNow = (h) => { const dt = new Date(now); dt.setHours(dt.getHours() + h); return dt.toISOString().slice(0, 19).replace('T', ' '); };

// ── Refresh dates only mode (non-destructive) ──
async function refreshDates() {
  let client;
  try {
    client = new Client(
      process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'codearena'
          }
    );
    await client.connect();
    console.log('🔄 Refreshing contest dates (non-destructive)...\n');

    const updates = [
      { title: 'Weekly Challenge #1', start: hoursAgo(2), end: hoursFromNow(22), status: 'ONGOING' },
      { title: 'Data Structures Sprint', start: hoursAgo(1), end: hoursFromNow(47), status: 'ONGOING' },
      { title: 'Monthly Marathon', start: daysFromNow(3), end: daysFromNow(4), status: 'UPCOMING' },
      { title: 'Beginner Bootcamp', start: daysAgo(6), end: daysAgo(5), status: 'ENDED' },
    ];

    for (const u of updates) {
      const result = await client.query(
        'UPDATE contests SET start_time = $1, end_time = $2, status = $3 WHERE title = $4',
        [u.start, u.end, u.status, u.title]
      );
      if (result.rowCount > 0) {
        console.log(`  ✓ ${u.title} → ${u.status} (${u.start} to ${u.end})`);
      } else {
        console.log(`  ⚠ ${u.title} not found (skipped)`);
      }
    }

    console.log('\n✅ Contest dates refreshed without affecting users, submissions, or participations!');
  } catch (err) {
    console.error('❌ Date refresh failed:', err.message);
    process.exit(1);
  } finally {
    if (client) await client.end();
  }
}

// ── Full seed mode (TRUNCATES everything) ──
async function seed() {
  let client;
  try {
    client = new Client(
      process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'codearena'
          }
    );
    await client.connect();
    console.log('🌱 Seeding database (FULL RESET)...\n');

    // Clear tables using CASCADE
    const tables = ['track_problems', 'learning_tracks', 'user_badges', 'submissions', 'participations', 'contest_problems', 'test_cases', 'problem_tags', 'notifications', 'problems', 'contests', 'users'];
    for (const t of tables) {
      await client.query(`TRUNCATE TABLE ${t} RESTART IDENTITY CASCADE`);
    }

    // ── Users ──
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('@admin123', salt);
    const sayanPass = await bcrypt.hash('@sayan123', salt);
    const alicePass = await bcrypt.hash('@alice123', salt);
    const bobPass = await bcrypt.hash('@bob123', salt);
    const charliePass = await bcrypt.hash('@charlie123', salt);

    await client.query(`INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`, ['admin', 'admin@codearena.com', adminPass, 'ADMIN']);
    await client.query(`INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`, ['sayan', 'sayan@codearena.com', sayanPass, 'USER']);
    await client.query(`INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`, ['alice', 'alice@codearena.com', alicePass, 'USER']);
    await client.query(`INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`, ['bob', 'bob@codearena.com', bobPass, 'USER']);
    await client.query(`INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)`, ['charlie', 'charlie@codearena.com', charliePass, 'USER']);
    console.log('  ✓ 5 users (1 admin + 4 users)');

    // ── Contests ──
    await client.query(
      `INSERT INTO contests (title, description, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5)`,
      ['Weekly Challenge #1', 'Weekly coding contest featuring classic algorithmic challenges. Solve problems using any language you prefer.', hoursAgo(2), hoursFromNow(22), 'ONGOING']
    );
    await client.query(
      `INSERT INTO contests (title, description, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5)`,
      ['Data Structures Sprint', 'A 2-day sprint focused on data structure problems — trees, graphs, and arrays.', hoursAgo(1), hoursFromNow(47), 'ONGOING']
    );
    await client.query(
      `INSERT INTO contests (title, description, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5)`,
      ['Monthly Marathon', 'Monthly competitive programming marathon with hard problems and big prizes.', daysFromNow(3), daysFromNow(4), 'UPCOMING']
    );
    await client.query(
      `INSERT INTO contests (title, description, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5)`,
      ['Beginner Bootcamp', 'A beginner-friendly contest with easy problems to get you started.', daysAgo(6), daysAgo(5), 'ENDED']
    );
    console.log('  ✓ 4 contests (2 ongoing, 1 upcoming, 1 ended)');

    // ── Problems (10 problems) ──
    const problems = [
      ['Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].', 'EASY', 100, '### Intuition\nUse a hash map to store the elements and their indices. For each element `nums[i]`, check if `target - nums[i]` exists in the map.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(N)'],
      ['Reverse String', 'Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.\n\nExample:\nInput: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]', 'EASY', 100, '### Intuition\nUse two pointers, one at the beginning and one at the end of the string. Swap the characters and move the pointers towards the center.\n\n### Complexity\n- **Time:** O(N)\n- **Space:** O(1)'],
      ['Palindrome Number', 'Given an integer x, return true if x is a palindrome, and false otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.\n\nExample:\nInput: x = 121\nOutput: true\nExplanation: 121 reads as 121 from left to right and from right to left.', 'EASY', 100, null],
      ['Longest Substring Without Repeating Characters', 'Given a string s, find the length of the longest substring without repeating characters.\n\nExample:\nInput: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.', 'MEDIUM', 200, null],
      ['Merge Intervals', 'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals.\n\nExample:\nInput: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]', 'MEDIUM', 200, null],
      ['Binary Tree Level Order Traversal', 'Given the root of a binary tree, return the level order traversal of its nodes values (i.e., from left to right, level by level).\n\nExample:\nInput: root = [3,9,20,null,null,15,7]\nOutput: [[3],[9,20],[15,7]]', 'MEDIUM', 200],
      ['Container With Most Water', 'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.', 'MEDIUM', 200, null],
      ['Median of Two Sorted Arrays', 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).\n\nExample:\nInput: nums1 = [1,3], nums2 = [2]\nOutput: 2.0', 'HARD', 300, null],
      ['Trapping Rain Water', 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.\n\nExample:\nInput: height = [0,1,0,2,1,0,1,3,2,1,2,1]\nOutput: 6', 'HARD', 300, null],
      ['Regular Expression Matching', 'Given an input string s and a pattern p, implement regular expression matching with support for . and * where:\n\n. Matches any single character.\n* Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).\n\nExample:\nInput: s = "aa", p = "a"\nOutput: false', 'HARD', 300, null],
    ];

    for (const [title, desc, diff, score, editorial] of problems) {
      await client.query(
        `INSERT INTO problems (title, description, difficulty, max_score, editorial) VALUES ($1, $2, $3, $4, $5)`,
        [title, desc, diff, score, editorial || null]
      );
    }
    console.log('  ✓ 10 problems (3 easy, 4 medium, 3 hard)');

    // ── Contest-Problem mappings ──
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (1, 1, 1)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (1, 4, 2)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (1, 5, 3)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (1, 8, 4)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (2, 2, 1)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (2, 3, 2)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (2, 6, 3)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (2, 7, 4)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (2, 9, 5)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (3, 5, 1)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (3, 7, 2)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (3, 8, 3)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (3, 9, 4)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (3, 10, 5)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (4, 1, 1)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (4, 2, 2)`);
    await client.query(`INSERT INTO contest_problems (contest_id, problem_id, sequence_order) VALUES (4, 3, 3)`);
    console.log('  ✓ contest-problem mappings');

    // ── Participations ──
    await client.query(`INSERT INTO participations (user_id, contest_id) VALUES (2, 1)`);
    await client.query(`INSERT INTO participations (user_id, contest_id) VALUES (3, 1)`);
    await client.query(`INSERT INTO participations (user_id, contest_id) VALUES (4, 1)`);
    await client.query(`INSERT INTO participations (user_id, contest_id) VALUES (2, 2)`);
    await client.query(`INSERT INTO participations (user_id, contest_id) VALUES (5, 2)`);
    await client.query(`INSERT INTO participations (user_id, contest_id) VALUES (2, 4)`);
    await client.query(`INSERT INTO participations (user_id, contest_id) VALUES (3, 4)`);
    await client.query(`INSERT INTO participations (user_id, contest_id) VALUES (4, 4)`);
    console.log('  ✓ participations');

    // ── Submissions ──
    await client.query(
      `INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES ($1, $2, $3, $4, $5, $6)`,
      [2, 1, 1, 'function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map[complement] !== undefined) return [map[complement], i];\n    map[nums[i]] = i;\n  }\n}', 'javascript', 100]
    );
    await client.query(
      `INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES ($1, $2, $3, $4, $5, $6)`,
      [2, 1, 4, 'def lengthOfLongestSubstring(s):\n    chars = set()\n    left = result = 0\n    for right in range(len(s)):\n        while s[right] in chars:\n            chars.remove(s[left])\n            left += 1\n        chars.add(s[right])\n        result = max(result, right - left + 1)\n    return result', 'python', 180]
    );
    await client.query(
      `INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES ($1, $2, $3, $4, $5, $6)`,
      [3, 1, 1, 'class Solution {\n  public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n      int comp = target - nums[i];\n      if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n      map.put(nums[i], i);\n    }\n    return new int[]{};\n  }\n}', 'java', 100]
    );
    await client.query(
      `INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES ($1, $2, $3, $4, $5, $6)`,
      [3, 1, 4, 'int lengthOfLongestSubstring(string s) {\n  unordered_set<char> chars;\n  int left = 0, result = 0;\n  for (int right = 0; right < s.size(); right++) {\n    while (chars.count(s[right])) chars.erase(s[left++]);\n    chars.insert(s[right]);\n    result = max(result, right - left + 1);\n  }\n  return result;\n}', 'cpp', 200]
    );
    await client.query(
      `INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES ($1, $2, $3, $4, $5, $6)`,
      [4, 1, 1, 'vector<int> twoSum(vector<int>& nums, int target) {\n  unordered_map<int, int> m;\n  for (int i = 0; i < nums.size(); i++) {\n    if (m.count(target - nums[i])) return {m[target - nums[i]], i};\n    m[nums[i]] = i;\n  }\n  return {};\n}', 'cpp', 80]
    );
    await client.query(
      `INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES ($1, $2, $3, $4, $5, $6)`,
      [2, 2, 2, 'def reverseString(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        s[left], s[right] = s[right], s[left]\n        left += 1\n        right -= 1', 'python', 100]
    );
    await client.query(
      `INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES ($1, $2, $3, $4, $5, $6)`,
      [5, 2, 3, 'bool isPalindrome(int x) {\n  if (x < 0) return false;\n  int rev = 0, original = x;\n  while (x > 0) {\n    rev = rev * 10 + x % 10;\n    x /= 10;\n  }\n  return original == rev;\n}', 'cpp', 100]
    );
    await client.query(
      `INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES ($1, $2, $3, $4, $5, $6)`,
      [2, 4, 1, 'const twoSum = (nums, target) => {\n  for (let i = 0; i < nums.length; i++)\n    for (let j = i+1; j < nums.length; j++)\n      if (nums[i] + nums[j] === target) return [i, j];\n}', 'javascript', 90]
    );
    await client.query(
      `INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES ($1, $2, $3, $4, $5, $6)`,
      [3, 4, 2, 'void reverseString(vector<char>& s) {\n  int l = 0, r = s.size()-1;\n  while (l < r) swap(s[l++], s[r--]);\n}', 'cpp', 100]
    );
    await client.query(
      `INSERT INTO submissions (user_id, contest_id, problem_id, code, language, score) VALUES ($1, $2, $3, $4, $5, $6)`,
      [4, 4, 3, 'def isPalindrome(x):\n    return str(x) == str(x)[::-1]', 'python', 100]
    );
    console.log('  ✓ 10 submissions');

    // ── Problem Tags ──
    const tagMap = [
      [1, ['Array', 'Hash Table']],
      [2, ['String', 'Two Pointers']],
      [3, ['Math']],
      [4, ['String', 'Sliding Window', 'Hash Table']],
      [5, ['Array', 'Sorting']],
      [6, ['Tree', 'BFS']],
      [7, ['Array', 'Two Pointers', 'Greedy']],
      [8, ['Array', 'Binary Search', 'Divide and Conquer']],
      [9, ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack']],
      [10, ['String', 'Dynamic Programming', 'Recursion']],
    ];
    for (const [pid, tags] of tagMap) {
      for (const tag of tags) {
        await client.query('INSERT INTO problem_tags (problem_id, tag) VALUES ($1, $2)', [pid, tag]);
      }
    }
    console.log('  ✓ problem tags');

    // ── Sample Test Cases ──
    const testCases = [
      [1, '2 7 11 15\n9', '0 1', true],
      [1, '3 2 4\n6', '1 2', true],
      [1, '3 3\n6', '0 1', false],
      [2, 'hello', 'olleh', true],
      [2, 'Hannah', 'hannaH', true],
      [3, '121', 'true', true],
      [3, '-121', 'false', true],
      [3, '10', 'false', false],
      [4, 'abcabcbb', '3', true],
      [4, 'bbbbb', '1', true],
      [4, 'pwwkew', '3', false],
      [5, '1 3\n2 6\n8 10\n15 18', '1 6\n8 10\n15 18', true],
      [5, '1 4\n4 5', '1 5', true],
      [6, '3 9 20 null null 15 7', '[[3],[9,20],[15,7]]', true],
      [7, '1 8 6 2 5 4 8 3 7', '49', true],
      [7, '1 1', '1', true],
      [8, '1 3\n2', '2.00000', true],
      [8, '1 2\n3 4', '2.50000', true],
      [9, '0 1 0 2 1 0 1 3 2 1 2 1', '6', true],
      [9, '4 2 0 3 2 5', '9', true],
      [10, 'aa\na', 'false', true],
      [10, 'aa\na*', 'true', true],
      [10, 'ab\n.*', 'true', true]
    ];
    for (const [pid, input, output, sample] of testCases) {
      await client.query(
        'INSERT INTO test_cases (problem_id, input, expected_output, is_sample) VALUES ($1, $2, $3, $4)',
        [pid, input, output, sample]
      );
    }
    console.log('  ✓ test cases');

    // ── Welcome Notifications ──
    await client.query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
      [2, 'Welcome to CodeArena! Start by joining a contest.', 'info']
    );
    await client.query(
      'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
      [2, 'Your solution for "Two Sum" scored 100/100', 'success']
    );
    console.log('  ✓ notifications');

    // ── User Badges ──
    await client.query('INSERT INTO user_badges (user_id, badge_name) VALUES ($1, $2)', [2, 'First Blood']);
    await client.query('INSERT INTO user_badges (user_id, badge_name) VALUES ($1, $2)', [2, '10-Streak']);
    await client.query('INSERT INTO user_badges (user_id, badge_name) VALUES ($1, $2)', [3, 'First Blood']);
    console.log('  ✓ user badges');

    // ── User Ratings Update (Mock Data) ──
    await client.query('UPDATE users SET rating = 1650 WHERE user_id = 2');
    await client.query('UPDATE users SET rating = 1580 WHERE user_id = 3');
    await client.query('UPDATE users SET rating = 1510 WHERE user_id = 4');

    // ── Learning Tracks ──
    await client.query(
      `INSERT INTO learning_tracks (title, description, difficulty) VALUES ($1, $2, $3)`,
      ['Algorithms 101', 'Master the basics of algorithms including sorting, searching, and fundamental math.', 'BEGINNER']
    );
    await client.query(
      `INSERT INTO learning_tracks (title, description, difficulty) VALUES ($1, $2, $3)`,
      ['Data Structures Mastery', 'Deep dive into arrays, strings, hash tables, and linked lists.', 'INTERMEDIATE']
    );
    await client.query(
      `INSERT INTO learning_tracks (title, description, difficulty) VALUES ($1, $2, $3)`,
      ['Advanced Graph Theory', 'Conquer complex graph algorithms like Dijkstra, Bellman-Ford, and A*.', 'ADVANCED']
    );
    console.log('  ✓ 3 learning tracks');

    // ── Track Problems ──
    // Algorithms 101: Two Sum (1), Reverse String (2), Palindrome Number (3)
    await client.query(`INSERT INTO track_problems (track_id, problem_id, sequence_order) VALUES (1, 1, 1)`);
    await client.query(`INSERT INTO track_problems (track_id, problem_id, sequence_order) VALUES (1, 2, 2)`);
    await client.query(`INSERT INTO track_problems (track_id, problem_id, sequence_order) VALUES (1, 3, 3)`);
    
    // Data Structures Mastery: Merge Intervals (5), Container With Most Water (7), Trapping Rain Water (9)
    await client.query(`INSERT INTO track_problems (track_id, problem_id, sequence_order) VALUES (2, 5, 1)`);
    await client.query(`INSERT INTO track_problems (track_id, problem_id, sequence_order) VALUES (2, 7, 2)`);
    await client.query(`INSERT INTO track_problems (track_id, problem_id, sequence_order) VALUES (2, 9, 3)`);
    console.log('  ✓ track-problem mappings');

    console.log('\n🎉 Database seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    if (client) await client.end();
  }
}

// ── Entry point ──
const args = process.argv.slice(2);

if (args.includes('--refresh-dates')) {
  refreshDates();
} else {
  console.log('⚠️  This will TRUNCATE all tables and re-seed from scratch.');
  console.log('   Use --refresh-dates to only update contest dates without wiping data.\n');
  seed();
}
