import { useState, useMemo } from 'react'

const MOCK_USERS = [
  {
    id: 1,
    name: 'You',
    email: 'you@example.com',
    totalCarbonSavedKg: 145.2,
    weeklyPoints: 320,
    streakDays: 21,
    completedGoals: 14,
    level: 'Eco Warrior',
    percentile: 95,
    isCurrentUser: true
  },
  {
    id: 2,
    name: 'Alex Green',
    email: 'alex.green@example.com',
    totalCarbonSavedKg: 168.5,
    weeklyPoints: 355,
    streakDays: 27,
    completedGoals: 18,
    level: 'Planet Champion',
    percentile: 98,
    isCurrentUser: false
  },
  {
    id: 3,
    name: 'Sam Rivera',
    email: 'sam.r@example.com',
    totalCarbonSavedKg: 130.7,
    weeklyPoints: 298,
    streakDays: 16,
    completedGoals: 11,
    level: 'Eco Warrior',
    percentile: 90,
    isCurrentUser: false
  },
  {
    id: 4,
    name: 'Taylor Lee',
    email: 'taylor.lee@example.com',
    totalCarbonSavedKg: 101.3,
    weeklyPoints: 245,
    streakDays: 9,
    completedGoals: 9,
    level: 'Green Starter',
    percentile: 80,
    isCurrentUser: false
  },
  {
    id: 5,
    name: 'Jordan Patel',
    email: 'jordan.p@example.com',
    totalCarbonSavedKg: 88.9,
    weeklyPoints: 220,
    streakDays: 5,
    completedGoals: 7,
    level: 'Green Starter',
    percentile: 72,
    isCurrentUser: false
  }
]

const VIEW_OPTIONS = ['This week', 'This month', 'All time']

function Leaderboard() {
  const [selectedView, setSelectedView] = useState('This week')

  // Later you’ll plug your API data + filters here
  const sortedUsers = useMemo(() => {
    // For now just sort by weeklyPoints descending
    return [...MOCK_USERS].sort((a, b) => b.weeklyPoints - a.weeklyPoints)
  }, [])

  const topThree = sortedUsers.slice(0, 3)
  const others = sortedUsers.slice(3)

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-header">
        <div>
          <h1 className="page-title">Community Leaderboard</h1>
          <p className="section-subtitle">
            Track your carbon footprint progress and see how you stack up
            against the GreenLoop community.
          </p>
        </div>

        <div className="view-toggle">
          {VIEW_OPTIONS.map((view) => (
            <button
              key={view}
              type="button"
              className={
                view === selectedView
                  ? 'toggle-chip toggle-chip--active'
                  : 'toggle-chip'
              }
              onClick={() => setSelectedView(view)}
            >
              {view}
            </button>
          ))}
        </div>
      </header>

      <section className="leaderboard-layout">
        {/* Left: leaderboard table */}
        <div className="leaderboard-card leaderboard-main-card">
          <div className="card-header-row">
            <h2>Rankings</h2>
            <span className="small-label">
              Showing: <strong>{selectedView}</strong>
            </span>
          </div>

          {/* Top 3 highlight */}
          <div className="podium-row">
            {topThree.map((user, index) => (
              <div
                key={user.id}
                className={
                  'podium-card ' +
                  (index === 0
                    ? 'podium-card--gold'
                    : index === 1
                    ? 'podium-card--silver'
                    : 'podium-card--bronze')
                }
              >
                <div className="podium-rank">#{index + 1}</div>
                <div className="avatar-circle avatar-circle--small">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div className="podium-name">{user.name}</div>
                <div className="podium-stat">
                  {user.weeklyPoints} pts · {user.totalCarbonSavedKg.toFixed(1)} kg
                  saved
                </div>
                {user.isCurrentUser && (
                  <span className="you-pill">You</span>
                )}
              </div>
            ))}
          </div>

          {/* Full table */}
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Participant</th>
                  <th>Total saved (kg CO₂)</th>
                  <th>Weekly points</th>
                  <th>Streak</th>
                  <th>Completed goals</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={user.isCurrentUser ? 'row-current-user' : ''}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <div className="user-cell">
                        <div className="avatar-circle avatar-circle--tiny">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="user-name-row">
                            <span className="user-name">{user.name}</span>
                            {user.isCurrentUser && (
                              <span className="you-pill you-pill--inline">
                                You
                              </span>
                            )}
                          </div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.totalCarbonSavedKg.toFixed(1)}</td>
                    <td>{user.weeklyPoints}</td>
                    <td>{user.streakDays} days</td>
                    <td>{user.completedGoals}</td>
                    <td>{user.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: your summary */}
        <aside className="leaderboard-card leaderboard-sidebar-card">
          <h2>Your impact</h2>
          <p className="section-subtitle">
            A quick snapshot of your current performance.
          </p>

          {(() => {
            const me =
              sortedUsers.find((u) => u.isCurrentUser) ?? sortedUsers[0]
            const rank =
              sortedUsers.findIndex((u) => u.id === me.id) + 1 || '-'
            return (
              <>
                <div className="summary-block">
                  <div className="summary-label">Your rank</div>
                  <div className="summary-value">
                    #{rank}{' '}
                    <span className="summary-subvalue">
                      Top {me.percentile}% of users
                    </span>
                  </div>
                </div>

                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-label">Total CO₂ saved</div>
                    <div className="summary-value">
                      {me.totalCarbonSavedKg.toFixed(1)} kg
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Weekly points</div>
                    <div className="summary-value">{me.weeklyPoints}</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Current streak</div>
                    <div className="summary-value">{me.streakDays} days</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Goals completed</div>
                    <div className="summary-value">
                      {me.completedGoals}
                    </div>
                  </div>
                </div>

                <div className="summary-block">
                  <div className="summary-label">Current level</div>
                  <div className="summary-value">{me.level}</div>
                  <p className="summary-tip">
                    Keep logging your actions—short walks, public transport,
                    reusable bottles—to climb the leaderboard.
                  </p>
                </div>

                <div className="actions-row">
                  <button type="button" className="primary-button">
                    Log a green activity
                  </button>
                  <button type="button" className="secondary-button">
                    View your goals
                  </button>
                </div>
              </>
            )
          })()}
        </aside>
      </section>
    </div>
  )
}

export default Leaderboard
