"use client"; // Enables client-side rendering for this component

import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  priority: string; // Added priority field
  dueDate?: string; // Optional due date field
}

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedTaskText, setEditedTaskText] = useState<string>("");
  const [taskPriority, setTaskPriority] = useState<string>("medium"); // Default priority
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");
  const [filter, setFilter] = useState<string>("all"); // State for task filter
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // State for dark mode

  useEffect(() => {
    setIsMounted(true);
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks) as Task[]);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  const addTask = (): void => {
    if (newTask.trim() !== "") {
      setTasks([
        ...tasks,
        { id: Date.now(), text: newTask, completed: false, priority: taskPriority },
      ]);
      setNewTask("");
      setTaskPriority("medium"); // Reset priority after adding
      setNotification("Task added!");
      setTimeout(() => setNotification(""), 2000);
    }
  };

  const toggleTaskCompletion = (id: number): void => {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const startEditingTask = (id: number, text: string, priority: string): void => {
    setEditingTaskId(id);
    setEditedTaskText(text);
    setTaskPriority(priority); // Set the priority of the task being edited
  };

  const updateTask = (): void => {
    if (editedTaskText.trim() !== "") {
      setTasks(tasks.map((task) =>
        task.id === editingTaskId ? { ...task, text: editedTaskText, priority: taskPriority } : task // Update task priority here
      ));
      setEditingTaskId(null);
      setEditedTaskText("");
      setTaskPriority("medium"); // Reset priority after editing
      setNotification("Task updated!");
      setTimeout(() => setNotification(""), 2000);
    }
  };

  const deleteTask = (id: number): void => {
    setTasks(tasks.filter((task) => task.id !== id));
    setNotification("Task deleted!");
    setTimeout(() => setNotification(""), 2000);
  };

  const clearCompletedTasks = (): void => {
    setTasks(tasks.filter(task => !task.completed));
    setNotification("Completed tasks cleared!");
    setTimeout(() => setNotification(""), 2000);
  };

  const toggleDarkMode = (): void => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center justify-center h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`w-full max-w-md ${isDarkMode ? 'bg-gray-600' : 'bg-white'} shadow-lg rounded-lg p-6`}>
        <h1 className="text-2xl font-bold mb-4 text-gray-400 dark:text-gray-200">
          Todo List
        </h1>
        
        <div className="mb-4 flex justify-between items-center">
          <div>
            <Button onClick={toggleDarkMode} className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button onClick={clearCompletedTasks} className="ml-2 bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded-md">
              Clear Completed
            </Button>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-gray-200 rounded-md ml-2">
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {notification && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md animate-pulse">
            {notification}
          </div>
        )}

        <div className="flex items-center mb-4">
          <Input
            type="text"
            placeholder="Add a new task"
            value={newTask}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
            className="flex-1 mr-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
          <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className="mr-2 border border-gray-300 rounded-md">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button onClick={addTask} className="bg-black hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md">
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md px-4 py-2 transition duration-200 ease-in-out transform hover:scale-105`}
            >
              <div className="flex items-center">
                <Checkbox
                  checked={task.completed}
                  className="mr-2"
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                />
                {editingTaskId === task.id ? (
                  <Input
                    type="text"
                    value={editedTaskText}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedTaskText(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        updateTask();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                  />
                ) : (
                  <span
                    className={`flex-1 text-gray-400 dark:text-gray-200 ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : ""}`}
                  >
                    {task.text} - <span className={`text-sm ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>{task.priority} priority</span>
                  </span>
                )}
              </div>
              <div className="flex items-center">
                {editingTaskId === task.id ? (
                  <Button
                    onClick={updateTask}
                    className="bg-black hover:bg-slate-800 text-white font-medium py-1 px-2 rounded-md mr-2"
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    onClick={() => startEditingTask(task.id, task.text, task.priority)} // Pass task priority to editing function
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-medium py-1 px-2 rounded-md mr-2"
                  >
                    Edit
                  </Button>
                )}
                <Button
                  onClick={() => deleteTask(task.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded-md"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
