# WorkZen Data Model

## Entities

### User

```text
{
  id: UUID
  email: String (unique)
  name: String
  createdAt: DateTime
  settings: {
    defaultDuration: Int
    theme: String
  }
}
```

### Task

```text
{
  id: UUID
  userId: UUID -> User
  title: String
  description: String (optional)
  priority: Enum [high, medium, low]
  status: Enum [pending, done]
  createdAt: DateTime
  completedAt: DateTime (optional)
}
```

### FocusSession

```text
{
  id: UUID
  userId: UUID -> User
  taskId: UUID -> Task (optional)
  startTime: DateTime
  endTime: DateTime (optional)
  duration: Int
  completed: Boolean
  notes: String (optional)
}
```

## Relationships

- One user has many tasks.
- One user has many focus sessions.
- One focus session can optionally link to one task.
- One task can have many focus sessions over time.

## Derived Metrics

| Metric | Formula |
| --- | --- |
| Completion Rate | completedTasks / totalTasks * 100 |
| Daily Streak | consecutive days with at least one session or completed task |
| Weekly Activity Percent | active days in last 7 / 7 * 100 |
| Total Focus Time | sum of focus session duration |
| Today Sessions | focus sessions where the date is today |
