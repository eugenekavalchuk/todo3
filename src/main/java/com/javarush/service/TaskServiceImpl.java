package com.javarush.service;

import com.javarush.entity.Task;
import com.javarush.repository.TaskRepository;
import lombok.RequiredArgsConstructor;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {
    private final TaskRepository taskRepository;

    @Override
    public List<Task> getAllTasks(int pageNumber, int pageSize) {
        return taskRepository.findAll().stream()
                .sorted(Comparator.comparingLong(Task::getId))
                .skip((long) pageNumber * pageSize)
                .limit(pageSize)
                .collect(Collectors.toList());
    }

    @Override
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    @Override
    public Task updateTask(Task task) {
        return taskRepository.save(task);
    }

    @Override
    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    @Override
    public int getAllCount() {
        return taskRepository.findAll().size();
    }
}
