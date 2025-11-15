import { useState, useEffect } from 'react'
import axios from 'axios'

function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics')
      setStats(response.data)
    } catch (error) {
      console.error('Analytics error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading analytics...</div>

  if (!stats || stats.totalCandidates === 0) {
    return (
      <div className="analytics-container">
        <h2>📊 Talent Pool Analytics</h2>
        <p className="no-data">No data available. Upload resumes to see insights.</p>
      </div>
    )
  }

  return (
    <div className="analytics-container">
      <h2>📊 Talent Pool Analytics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCandidates}</div>
          <div className="stat-label">Total Candidates</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.averageExperience}</div>
          <div className="stat-label">Avg Experience (years)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalUniqueSkills}</div>
          <div className="stat-label">Unique Skills</div>
        </div>
      </div>

      <div className="top-skills-section">
        <h3>🎯 Top 10 Skills in Pool</h3>
        <div className="skills-grid">
          {stats.topSkills.map((skill, idx) => {
            const percentage = Math.round((skill.count / stats.totalCandidates) * 100);
            const isTopSkill = idx < 3;
            
            // Get tech logo URL from CDN
            const getTechLogo = (skillName) => {
              const name = skillName.toLowerCase();
              const baseUrl = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
              
              if (name.includes('react')) return `${baseUrl}/react/react-original.svg`;
              if (name.includes('node')) return `${baseUrl}/nodejs/nodejs-original.svg`;
              if (name.includes('python')) return `${baseUrl}/python/python-original.svg`;
              if (name.includes('java') && !name.includes('script')) return `${baseUrl}/java/java-original.svg`;
              if (name.includes('javascript')) return `${baseUrl}/javascript/javascript-original.svg`;
              if (name.includes('typescript')) return `${baseUrl}/typescript/typescript-original.svg`;
              if (name.includes('aws')) return `${baseUrl}/amazonwebservices/amazonwebservices-original-wordmark.svg`;
              if (name.includes('docker')) return `${baseUrl}/docker/docker-original.svg`;
              if (name.includes('git')) return `${baseUrl}/git/git-original.svg`;
              if (name.includes('mongodb')) return `${baseUrl}/mongodb/mongodb-original.svg`;
              if (name.includes('mysql')) return `${baseUrl}/mysql/mysql-original.svg`;
              if (name.includes('postgresql')) return `${baseUrl}/postgresql/postgresql-original.svg`;
              if (name.includes('html')) return `${baseUrl}/html5/html5-original.svg`;
              if (name.includes('css')) return `${baseUrl}/css3/css3-original.svg`;
              if (name.includes('vue')) return `${baseUrl}/vuejs/vuejs-original.svg`;
              if (name.includes('angular')) return `${baseUrl}/angularjs/angularjs-original.svg`;
              if (name.includes('firebase')) return `${baseUrl}/firebase/firebase-plain.svg`;
              if (name.includes('kubernetes')) return `${baseUrl}/kubernetes/kubernetes-plain.svg`;
              if (name.includes('jenkins')) return `${baseUrl}/jenkins/jenkins-original.svg`;
              if (name.includes('express')) return `${baseUrl}/express/express-original.svg`;
              if (name.includes('django')) return `${baseUrl}/django/django-plain.svg`;
              if (name.includes('flask')) return `${baseUrl}/flask/flask-original.svg`;
              if (name.includes('redis')) return `${baseUrl}/redis/redis-original.svg`;
              if (name.includes('graphql')) return `${baseUrl}/graphql/graphql-plain.svg`;
              if (name.includes('linux')) return `${baseUrl}/linux/linux-original.svg`;
              if (name.includes('ubuntu')) return `${baseUrl}/ubuntu/ubuntu-plain.svg`;
              if (name.includes('nginx')) return `${baseUrl}/nginx/nginx-original.svg`;
              if (name.includes('azure')) return `${baseUrl}/azure/azure-original.svg`;
              if (name.includes('gcp') || name.includes('google cloud')) return `${baseUrl}/googlecloud/googlecloud-original.svg`;
              if (name.includes('tailwind')) return `${baseUrl}/tailwindcss/tailwindcss-plain.svg`;
              if (name.includes('bootstrap')) return `${baseUrl}/bootstrap/bootstrap-original.svg`;
              if (name.includes('sass')) return `${baseUrl}/sass/sass-original.svg`;
              if (name.includes('webpack')) return `${baseUrl}/webpack/webpack-original.svg`;
              if (name.includes('babel')) return `${baseUrl}/babel/babel-original.svg`;
              if (name.includes('redux')) return `${baseUrl}/redux/redux-original.svg`;
              if (name.includes('nextjs') || name.includes('next.js')) return `${baseUrl}/nextjs/nextjs-original.svg`;
              if (name.includes('spring')) return `${baseUrl}/spring/spring-original.svg`;
              if (name.includes('c++')) return `${baseUrl}/cplusplus/cplusplus-original.svg`;
              if (name.includes('c#')) return `${baseUrl}/csharp/csharp-original.svg`;
              if (name.includes('go') || name.includes('golang')) return `${baseUrl}/go/go-original.svg`;
              if (name.includes('rust')) return `${baseUrl}/rust/rust-plain.svg`;
              if (name.includes('php')) return `${baseUrl}/php/php-original.svg`;
              if (name.includes('ruby')) return `${baseUrl}/ruby/ruby-original.svg`;
              if (name.includes('swift')) return `${baseUrl}/swift/swift-original.svg`;
              if (name.includes('kotlin')) return `${baseUrl}/kotlin/kotlin-original.svg`;
              
              // Default icon
              return 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/devicon/devicon-original.svg';
            };
            
            return (
              <div key={idx} className={`skill-card ${isTopSkill ? 'top-skill' : ''}`}>
                <div className="skill-icon">
                  <img 
                    src={getTechLogo(skill.skill)} 
                    alt={skill.skill}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/devicon/devicon-original.svg';
                    }}
                  />
                </div>
                <div className="skill-content">
                  <div className="skill-header">
                    <span className="skill-name">{skill.skill}</span>
                    <span className="skill-badge">{skill.count} candidates</span>
                  </div>
                  <div className="skill-percentage">{percentage}%</div>
                  <div className="skill-bar-modern">
                    <div 
                      className="skill-bar-fill" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="skill-rank-badge">#{idx + 1}</div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={fetchAnalytics} className="refresh-btn">
        🔄 Refresh Analytics
      </button>
    </div>
  )
}

export default Analytics
