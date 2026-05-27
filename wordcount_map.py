"""wordcount_map.py —— 使用 Python 内置 map() 实现 MapReduce"""

from functools import partial
from collections import defaultdict

# 文档数据
docs = ["Hello World", "Hello Cloud", "Cloud Computing is great"]


def split_input(documents, num_shards=3):
    """将文档分割成多个分片（模拟数据分片）"""
    return [documents[i::num_shards] for i in range(num_shards)]


def map_phase(shard):
    """Map 阶段：将每个文档映射为 (word, 1) 键值对列表"""
    out = []
    for doc in shard:
        for word in doc.lower().split():
            out.append((word, 1))
    return out


def shuffle_phase(map_outputs):
    """Shuffle 阶段：将相同 key 的值聚合到一起"""
    grouped = defaultdict(list)
    for partial in map_outputs:
        for k, v in partial:
            grouped[k].append(v)
    return dict(grouped)


def reduce_phase(grouped):
    """Reduce 阶段：汇总每个 key 的所有值"""
    return {k: sum(vs) for k, vs in grouped.items()}


# ==================== 使用 map() 的函数式版本 ====================

def word_mapper(doc):
    """映射单个文档，返回 (word, 1) 元组列表"""
    return [(word, 1) for word in doc.lower().split()]


def word_reducer(word, counts):
    """对单个 word 的所有计数求和"""
    return (word, sum(counts))


# 使用 map() 进行分片映射
shards = split_input(docs)

# Map 阶段：使用 map 对每个分片应用 map_phase
map_results = list(map(map_phase, shards))
print("Map 输出:", map_results)

# Shuffle 阶段：合并所有 map 结果
grouped = shuffle_phase(map_results)
print("Shuffle 输出:", grouped)

# Reduce 阶段：统计词频
final = reduce_phase(grouped)
print("Final 输出:", final)


# ==================== 纯 map() 函数式实现 ====================

print("\n--- 纯 map() 函数式实现 ---")

# Step 1: 所有文档直接映射为 (word, 1) 对
all_mapped = list(map(word_mapper, docs))
print("所有文档映射结果:", all_mapped)

# Step 2: 展平列表（将嵌套的列表合并为一个）
flat_mapped = []
for sublist in all_mapped:
    flat_mapped.extend(sublist)
# 或者用 map 实现展平
def extend_fn(acc, item):
    acc.extend(item)
    return acc
flat_mapped = [item for sublist in all_mapped for item in sublist]
print("展平后:", flat_mapped)

# Step 3: Shuffle - 按 word 分组
grouped = defaultdict(list)
for word, count in flat_mapped:
    grouped[word].append(count)
print("分组后:", dict(grouped))

# Step 4: Reduce - 使用 map 替代字典推导式
# 为每个 word 调用 reducer
items = list(grouped.items())
final_functional = dict(map(lambda item: (item[0], sum(item[1])), items))
print("函数式最终结果:", final_functional)
