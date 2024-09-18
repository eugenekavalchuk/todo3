package com.javarush.controller;

import com.javarush.entity.Task;
import com.javarush.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static java.util.Objects.isNull;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    @GetMapping()
    public List<Task> getAllTasks(@RequestParam(required = false) Integer pageNumber,
                                  @RequestParam(required = false) Integer pageSize) {
        pageNumber = isNull(pageNumber) ? 0 : pageNumber;
        pageSize = isNull(pageSize) ? 3 : pageSize;

        return taskService.getAllTasks(pageNumber, pageSize);
    }

    @PostMapping()
    public Task createOrUpdateTask(@RequestBody Task task) {
        if (isNull(task.getId())) {
            return taskService.createTask(task);
        }

        return taskService.updateTask(task);
    }

    @DeleteMapping("/{taskId}")
    public boolean deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return true;
    }

    @GetMapping("/count")
    public Integer getAllCount() {
        return taskService.getAllCount();
    }
}
