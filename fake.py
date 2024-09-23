import csv
import random

# Define the number of instances and processes
num_instances = 6
num_processes = 15

# Define the process names
process_names = [f"Process_{chr(65 + i)}" for i in range(num_processes)]

# Define the number of CPU cores
num_cores = 8

# Define the total CPU time range
total_cpu_time_range = (100, 1000)

# Define the total time range
total_time_range = (500, 2000)

# Create a list to hold the rows
rows = []

# Generate the data
for instance_id in range(1, num_instances + 1):
    for process_name in process_names:
        total_cpu_time_ms = random.randint(*total_cpu_time_range)
        total_time_ms = random.randint(*total_time_range)
        
        # Distribute the total CPU time across cores
        cpu_times_per_core = [random.randint(1, total_cpu_time_ms // 2) for _ in range(num_cores - 1)]
        cpu_times_per_core.append(total_cpu_time_ms - sum(cpu_times_per_core))
        random.shuffle(cpu_times_per_core)  # Shuffle to make it more random
        
        for cpu_core, cpu_time_ms_per_core in enumerate(cpu_times_per_core):
            rows.append([instance_id, process_name, total_cpu_time_ms, cpu_core, cpu_time_ms_per_core, total_time_ms])

# Write the data to a CSV file
with open('instance_data.csv', 'w', newline='') as csvfile:
    csvwriter = csv.writer(csvfile)
    csvwriter.writerow(['instance_id', 'process_name', 'total_cpu_time_ms', 'cpu_core', 'cpu_time_ms_per_core', 'total_time_ms'])
    csvwriter.writerows(rows)

print("CSV file 'instance_data.csv' has been generated.")