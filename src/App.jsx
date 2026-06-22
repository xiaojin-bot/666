import {
  Battery,
  BookOpen,
  CalendarDays,
  Check,
  CircleUserRound,
  Droplets,
  Dumbbell,
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

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
    name: defaultNameById[habit.id] ?? habit.name,
  }));
}

function createHabit(name) {
  const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    name,
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

function App() {
  const todayKey = useMemo(() => getTodayKey(), []);
  const [habits, setHabits] = useState(() => {
    const storedHabits = loadStoredValue(HABITS_KEY, defaultHabits);
    const initialHabits = storedHabits.length ? storedHabits : defaultHabits;
    const normalizedHabits = normalizeHabits(initialHabits);
    saveStoredValue(HABITS_KEY, normalizedHabits);

    return normalizedHabits;
  });
  const [completions, setCompletions] = useState(() => loadStoredValue(COMPLETIONS_KEY, {}));
  const [newHabitName, setNewHabitName] = useState('');

  const todayCompletions = completions[todayKey] ?? {};
  const completedCount = habits.filter((habit) => todayCompletions[habit.id]).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  function updateHabits(nextHabits) {
    setHabits(nextHabits);
    saveStoredValue(HABITS_KEY, nextHabits);
  }

  function updateCompletions(nextCompletions) {
    setCompletions(nextCompletions);
    saveStoredValue(COMPLETIONS_KEY, nextCompletions);
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

  function renameHabit(habitId, name) {
    updateHabits(
      habits.map((habit) => (habit.id === habitId ? { ...habit, name } : habit)),
    );
  }

  function toggleHabit(habitId) {
    updateCompletions({
      ...completions,
      [todayKey]: {
        ...todayCompletions,
        [habitId]: !todayCompletions[habitId],
      },
    });
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
              <span className="hero-pill">{completedCount}/{habits.length}</span>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <span className="sun" />
              <span className="arch arch-one" />
              <span className="arch arch-two" />
              <span className="plant plant-left" />
              <span className="plant plant-right" />
            </div>
          </section>

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

          <nav className="bottom-tabs" aria-label="页面导航">
            <button className="is-active" type="button" aria-label="首页">
              <Home size={20} strokeWidth={2.1} />
            </button>
            <button type="button" aria-label="日历">
              <CalendarDays size={20} strokeWidth={2.1} />
            </button>
            <button type="button" aria-label="灵感">
              <Sparkles size={20} strokeWidth={2.1} />
            </button>
            <button type="button" aria-label="我的">
              <CircleUserRound size={20} strokeWidth={2.1} />
            </button>
          </nav>
        </div>
      </section>
    </main>
  );
}

export default App;
