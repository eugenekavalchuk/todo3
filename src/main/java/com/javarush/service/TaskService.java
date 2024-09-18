package com.javarush.service;

import com.javarush.entity.Task;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface TaskService {
    default List<Task> getAllTasks(int pageNumber, int pageSize) {
        throw new UnsupportedOperationException();
    }

    default Task createTask(Task task) {
        throw new UnsupportedOperationException();
    }

    default Task updateTask(Task task) {
        throw new UnsupportedOperationException();
    }

    default void deleteTask(Long taskId) {
        throw new UnsupportedOperationException();
    }

    default int getAllCount() {
        throw new UnsupportedOperationException();
    }
}
