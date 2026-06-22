import {
  Battery,
  BookOpen,
  CalendarDays,
  Check,
  CircleUserRound,
  ClipboardList,
  Droplets,
  Dumbbell,
  Flame,
  Home,
  Plus,
  Signal,
  Sparkles,
  Trash2,
  Wifi,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const HABITS_KEY = 'habits';
const COMPLETIONS_KEY = 'completions';
const TODOS_KEY = 'todos';

const defaultHabits = [
  { id: 'default-water', name: '喝水', createdAt: '2026-06-22T00:00:00.000Z' },
  { id: 'default-exercise', name: '运动', createdAt: '2026-06-22T00:00:00.000Z' },
  { id: 'default-read', name: '读书', createdAt: '2026-06-22T00:00:00.000Z' },
];

const defaultNameById = {
  'default-water': '喝水',
  'default-exercise': '运动',
  'default-read': '读书',
};

const brokenDefaultNameById = {
  'default-water': '鍠濇按',
  'default-exercise': '杩愬姩',
  'default-read': '璇讳功',
};

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function loadStoredValue(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : fallback;
  } catch {
    return fallback;
  }
}

function saveStoredValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeHabits(habits) {
  return habits.map((habit) => ({
    ...habit,
    name: habit.name === brokenDefaultNameById[habit.id]
      ? defaultNameById[habit.id]
      : habit.name,
  }));
}

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createHabit(name) {
  return {
    id: createId(),
    name,
    createdAt: new Date().toISOString(),
  };
}

function createTodo(title, dueDate) {
  return {
    id: createId(),
    title,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

function getHabitIcon(name) {
  if (name.includes('水') || name.includes('喝')) {
    return Droplets;
  }

  if (name.includes('运动') || name.includes('跑') || name.includes('健身')) {
    return Dumbbell;
  }

  if (name.includes('读') || name.includes('书')) {
    return BookOpen;
  }

  return Sparkles;
}

function formatTodayLabel() {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());
}

function formatDateLabel(dateKey) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(parseDateKey(dateKey));
}

function countCompletedForDate(habits, completions, dateKey) {
  const dateCompletions = completions[dateKey] ?? {};
  return habits.filter((habit) => dateCompletions[habit.id]).length;
}

function hasCheckedInOnDate(habits, completions, dateKey) {
  return countCompletedForDate(habits, completions, dateKey) > 0;
}

function calculateStreak(habits, completions, todayKey) {
  if (habits.length === 0) {
    return 0;
  }

  let streak = 0;
  let currentDate = parseDateKey(todayKey);

  while (hasCheckedInOnDate(habits, completions, getDateKey(currentDate))) {
    streak += 1;
    currentDate = addDays(currentDate, -1);
  }

  return streak;
}

function App() {
  const todayKey = useMemo(() => getDateKey(), []);
  const dateOptions = useMemo(
    () => Array.from({ length: 14 }, (_, index) => getDateKey(addDays(new Date(), index - 7))),
    [],
  );
  const [activeView, setActiveView] = useState('home');
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [habits, setHabits] = useState(() => {
    const storedHabits = loadStoredValue(HABITS_KEY, defaultHabits);
    const initialHabits = storedHabits.length ? storedHabits : defaultHabits;
    const normalizedHabits = normalizeHabits(initialHabits);
    saveStoredValue(HABITS_KEY, normalizedHabits);

    return normalizedHabits;
  });
  const [completions, setCompletions] = useState(() => loadStoredValue(COMPLETIONS_KEY, {}));
  const [todos, setTodos] = useState(() => loadStoredValue(TODOS_KEY, []));
  const [newHabitName, setNewHabitName] = useState('');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDate, setNewTodoDate] = useState(todayKey);

  const todayCompletions = completions[todayKey] ?? {};
  const completedCount = countCompletedForDate(habits, completions, todayKey);
  const selectedCompletedCount = countCompletedForDate(habits, completions, selectedDate);
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
  const streakCount = calculateStreak(habits, completions, todayKey);
  const pendingTodoCount = todos.filter((todo) => !todo.completed).length;

  function updateHabits(nextHabits) {
    setHabits(nextHabits);
    saveStoredValue(HABITS_KEY, nextHabits);
  }

  function updateCompletions(nextCompletions) {
    setCompletions(nextCompletions);
    saveStoredValue(COMPLETIONS_KEY, nextCompletions);
  }

  function updateTodos(nextTodos) {
    setTodos(nextTodos);
    saveStoredValue(TODOS_KEY, nextTodos);
  }

  function handleAddHabit(event) {
    event.preventDefault();

    const trimmedName = newHabitName.trim();
    if (!trimmedName) {
      return;
    }

    updateHabits([...habits, createHabit(trimmedName)]);
    setNewHabitName('');
  }

  function handleAddTodo(event) {
    event.preventDefault();

    const trimmedTitle = newTodoTitle.trim();
    if (!trimmedTitle) {
      return;
    }

    updateTodos([...todos, createTodo(trimmedTitle, newTodoDate)]);
    setNewTodoTitle('');
    setNewTodoDate(todayKey);
  }

  function renameHabit(habitId, name) {
    updateHabits(
      habits.map((habit) => (habit.id === habitId ? { ...habit, name } : habit)),
    );
  }

  function renameTodo(todoId, title) {
    updateTodos(
      todos.map((todo) => (todo.id === todoId ? { ...todo, title } : todo)),
    );
  }

  function toggleHabit(habitId, dateKey = todayKey) {
    const dateCompletions = completions[dateKey] ?? {};

    updateCompletions({
      ...completions,
      [dateKey]: {
        ...dateCompletions,
        [habitId]: !dateCompletions[habitId],
      },
    });
  }

  function toggleTodo(todoId) {
    updateTodos(
      todos.map((todo) => (
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )),
    );
  }

  function deleteHabit(habitId) {
    updateHabits(habits.filter((habit) => habit.id !== habitId));

    const nextCompletions = Object.fromEntries(
      Object.entries(completions).map(([date, dateCompletions]) => {
        const { [habitId]: _deleted, ...remainingCompletions } = dateCompletions;
        return [date, remainingCompletions];
      }),
    );

    updateCompletions(nextCompletions);
  }

  function deleteTodo(todoId) {
    updateTodos(todos.filter((todo) => todo.id !== todoId));
  }

  function openView(view) {
    setActiveView(view);
  }

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="习惯打卡">
        <div className="phone-screen">
          <div className="status-bar" aria-hidden="true">
            <span>9:41</span>
            <span className="notch" />
            <span className="status-icons">
              <Signal size={14} strokeWidth={2.2} />
              <Wifi size={14} strokeWidth={2.2} />
              <Battery size={16} strokeWidth={2.1} />
            </span>
          </div>

          <header className="app-header">
            <p className="date-label">{formatTodayLabel()}</p>
            <h1>习惯打卡</h1>
          </header>

          <section className="hero-card">
            <div className="hero-copy">
              <span className="hero-kicker">今日计划</span>
              <strong>完成 {completedCount} 项</strong>
              <div className="rainbow-progress" aria-label={`今日完成进度 ${progressPercent}%`}>
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              <span>共 {habits.length} 项习惯</span>
              <div className="hero-metrics">
                <span className="hero-pill">{completedCount}/{habits.length}</span>
                <span className="streak-pill">
                  <Flame size={14} strokeWidth={2.2} />
                  连续 {streakCount} 天
                </span>
              </div>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <span className="sun" />
              <span className="arch arch-one" />
              <span className="arch arch-two" />
              <span className="plant plant-left" />
              <span className="plant plant-right" />
            </div>
          </section>

          <div className="view-content">
            {activeView === 'home' && (
              <>
                <form className="add-form" onSubmit={handleAddHabit}>
                  <input
                    aria-label="添加想坚持的习惯"
                    placeholder="添加想坚持的习惯"
                    type="text"
                    value={newHabitName}
                    onChange={(event) => setNewHabitName(event.target.value)}
                  />
                  <button type="submit" aria-label="添加">
                    <Plus size={17} strokeWidth={2.2} />
                    <span>添加</span>
                  </button>
                </form>

                <section className="habit-section">
                  <div className="section-heading">
                    <span>今日完成</span>
                    <strong>{completedCount} / {habits.length}</strong>
                  </div>

                  {habits.length > 0 ? (
                    <div className="habit-list">
                      {habits.map((habit) => {
                        const completed = Boolean(todayCompletions[habit.id]);
                        const HabitIcon = getHabitIcon(habit.name);
                        const habitLabel = habit.name || '习惯';

                        return (
                          <article className={`habit-item ${completed ? 'is-completed' : ''}`} key={habit.id}>
                            <button
                              className="check-button"
                              type="button"
                              aria-label={completed ? `取消完成${habitLabel}` : `完成${habitLabel}`}
                              aria-pressed={completed}
                              onClick={() => toggleHabit(habit.id)}
                            >
                              <Check size={18} strokeWidth={2.8} />
                            </button>

                            <span className="habit-icon" aria-hidden="true">
                              <HabitIcon size={19} strokeWidth={2} />
                            </span>

                            <div className="habit-content">
                              <input
                                className="habit-name-input"
                                aria-label={`修改${habitLabel}内容`}
                                type="text"
                                value={habit.name}
                                onChange={(event) => renameHabit(habit.id, event.target.value)}
                              />
                              <p>{completed ? '已完成' : '未完成'}</p>
                            </div>

                            <button
                              className="delete-button"
                              type="button"
                              aria-label={`删除${habitLabel}`}
                              onClick={() => deleteHabit(habit.id)}
                            >
                              <Trash2 size={17} strokeWidth={2.2} />
                            </button>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="empty-state">今天从一个小习惯开始。</p>
                  )}
                </section>
              </>
            )}

            {activeView === 'calendar' && (
              <section className="calendar-section">
                <div className="section-heading">
                  <span>日期记录</span>
                  <strong>{selectedCompletedCount} / {habits.length}</strong>
                </div>

                <div className="date-strip" aria-label="选择日期">
                  {dateOptions.map((dateKey) => {
                    const date = parseDateKey(dateKey);
                    const checked = hasCheckedInOnDate(habits, completions, dateKey);
                    const selected = selectedDate === dateKey;

                    return (
                      <button
                        className={`${selected ? 'is-selected' : ''} ${checked ? 'has-record' : ''}`}
                        type="button"
                        key={dateKey}
                        onClick={() => setSelectedDate(dateKey)}
                      >
                        <span>{new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(date)}</span>
                        <strong>{date.getDate()}</strong>
                      </button>
                    );
                  })}
                </div>

                <div className="selected-date-card">
                  <p>{formatDateLabel(selectedDate)}</p>
                  <strong>完成 {selectedCompletedCount} 项</strong>
                </div>

                <div className="habit-list compact-list">
                  {habits.map((habit) => {
                    const dateCompletions = completions[selectedDate] ?? {};
                    const completed = Boolean(dateCompletions[habit.id]);
                    const HabitIcon = getHabitIcon(habit.name);
                    const habitLabel = habit.name || '习惯';

                    return (
                      <article className={`habit-item ${completed ? 'is-completed' : ''}`} key={habit.id}>
                        <button
                          className="check-button"
                          type="button"
                          aria-label={completed ? `取消${formatDateLabel(selectedDate)}的${habitLabel}` : `补记${formatDateLabel(selectedDate)}的${habitLabel}`}
                          aria-pressed={completed}
                          onClick={() => toggleHabit(habit.id, selectedDate)}
                        >
                          <Check size={18} strokeWidth={2.8} />
                        </button>
                        <span className="habit-icon" aria-hidden="true">
                          <HabitIcon size={19} strokeWidth={2} />
                        </span>
                        <div className="habit-content">
                          <h2>{habitLabel}</h2>
                          <p>{completed ? '已完成' : '未完成'}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {activeView === 'todos' && (
              <section className="todo-section">
                <div className="section-heading">
                  <span>待办事项</span>
                  <strong>{pendingTodoCount} 项待办</strong>
                </div>

                <form className="todo-form" onSubmit={handleAddTodo}>
                  <input
                    aria-label="添加待办事项"
                    placeholder="添加待办事项"
                    type="text"
                    value={newTodoTitle}
                    onChange={(event) => setNewTodoTitle(event.target.value)}
                  />
                  <input
                    aria-label="选择待办日期"
                    type="date"
                    value={newTodoDate}
                    onChange={(event) => setNewTodoDate(event.target.value)}
                  />
                  <button type="submit" aria-label="添加待办">
                    <Plus size={17} strokeWidth={2.2} />
                    <span>添加</span>
                  </button>
                </form>

                {todos.length > 0 ? (
                  <div className="todo-list">
                    {todos.map((todo) => (
                      <article className={`todo-item ${todo.completed ? 'is-completed' : ''}`} key={todo.id}>
                        <button
                          className="check-button"
                          type="button"
                          aria-label={todo.completed ? `取消完成${todo.title || '待办'}` : `完成${todo.title || '待办'}`}
                          aria-pressed={todo.completed}
                          onClick={() => toggleTodo(todo.id)}
                        >
                          <Check size={18} strokeWidth={2.8} />
                        </button>
                        <div className="todo-content">
                          <input
                            className="habit-name-input"
                            aria-label="修改待办事项"
                            type="text"
                            value={todo.title}
                            onChange={(event) => renameTodo(todo.id, event.target.value)}
                          />
                          <p>{todo.dueDate ? formatDateLabel(todo.dueDate) : '未设置日期'}</p>
                        </div>
                        <button
                          className="delete-button"
                          type="button"
                          aria-label={`删除${todo.title || '待办'}`}
                          onClick={() => deleteTodo(todo.id)}
                        >
                          <Trash2 size={17} strokeWidth={2.2} />
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">先写下今天要做的一件事。</p>
                )}
              </section>
            )}

            {activeView === 'profile' && (
              <section className="profile-section">
                <div className="section-heading">
                  <span>我的</span>
                  <strong>本地记录</strong>
                </div>
                <div className="summary-grid">
                  <div>
                    <span>连续打卡</span>
                    <strong>{streakCount} 天</strong>
                  </div>
                  <div>
                    <span>习惯数量</span>
                    <strong>{habits.length} 项</strong>
                  </div>
                  <div>
                    <span>待办事项</span>
                    <strong>{todos.length} 项</strong>
                  </div>
                  <div>
                    <span>今日完成</span>
                    <strong>{completedCount} 项</strong>
                  </div>
                </div>
              </section>
            )}
          </div>

          <nav className="bottom-tabs" aria-label="页面导航">
            <button className={activeView === 'home' ? 'is-active' : ''} type="button" aria-label="首页" onClick={() => openView('home')}>
              <Home size={20} strokeWidth={2.1} />
            </button>
            <button className={activeView === 'calendar' ? 'is-active' : ''} type="button" aria-label="日历" onClick={() => openView('calendar')}>
              <CalendarDays size={20} strokeWidth={2.1} />
            </button>
            <button className={activeView === 'todos' ? 'is-active' : ''} type="button" aria-label="待办" onClick={() => openView('todos')}>
              <ClipboardList size={20} strokeWidth={2.1} />
            </button>
            <button className={activeView === 'profile' ? 'is-active' : ''} type="button" aria-label="我的" onClick={() => openView('profile')}>
              <CircleUserRound size={20} strokeWidth={2.1} />
            </button>
          </nav>
        </div>
      </section>
    </main>
  );
}

export default App;
