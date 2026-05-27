"""pi_mpi_map.py —— 使用 map() 实现的并行 π 计算（兼容本地测试）
运行 MPI: mpiexec -n 4 python pi_mpi_map.py
本地测试: python pi_mpi_map.py
"""

# ==================== MPI 版本 ====================
try:
    from mpi4py import MPI
    USE_MPI = True
except ImportError:
    USE_MPI = False

import random


def calculate_pi_mpi():
    """MPI 并行版本"""
    comm = MPI.COMM_WORLD
    rank, size = comm.Get_rank(), comm.Get_size()

    N_TOTAL = 10_000_000
    N_LOCAL = N_TOTAL // size

    random.seed(rank * 42)

    # Map 阶段：使用 map() 检查每个随机点
    def check_hit(_):
        x, y = random.random(), random.random()
        return 1 if x**2 + y**2 <= 1.0 else 0

    hits = sum(map(check_hit, range(N_LOCAL)))
    total_hits = comm.reduce(hits, op=MPI.SUM, root=0)

    if rank == 0:
        pi_est = 4.0 * total_hits / N_TOTAL
        print(f"MPI 版本: π ≈ {pi_est:.6f}")


def calculate_pi_local():
    """本地单进程版本（使用 map()）"""
    N = 10_000_000

    # Map 阶段：生成 N 个点并检查是否命中
    def check_hit(_):
        x, y = random.random(), random.random()
        return 1 if x**2 + y**2 <= 1.0 else 0

    # 使用 map() 替代显式循环
    hits = sum(map(check_hit, range(N)))
    pi_est = 4.0 * hits / N
    print(f"本地版本: π ≈ {pi_est:.6f}")


def calculate_pi_map_reduce():
    """纯 map/reduce 函数式风格版本"""
    N = 10_000_000

    # 生成随机坐标对
    def generate_point(_):
        return (random.random(), random.random())

    # Map: 检查每个点
    def check_hit(point):
        x, y = point
        return 1 if x**2 + y**2 <= 1.0 else 0

    # 生成点 → 检查命中 → 求和
    points = map(generate_point, range(N))
    hits = sum(map(check_hit, points))
    pi_est = 4.0 * hits / N
    print(f"Map-Reduce 版本: π ≈ {pi_est:.6f}")


if __name__ == "__main__":
    if USE_MPI:
        calculate_pi_mpi()
    else:
        print("MPI 未安装，使用本地版本测试...\n")
        calculate_pi_local()
        print()
        calculate_pi_map_reduce()
