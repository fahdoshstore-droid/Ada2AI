import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>الصفحة غير موجودة</p>
      <Link to="/">العودة للرئيسية</Link>
      <style>{`
        .not-found {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        h1 {
          font-size: 6rem;
          margin-bottom: 0.5rem;
        }
        p {
          font-size: 1.5rem;
          margin-bottom: 2rem;
        }
        a {
          padding: 1rem 2rem;
          background: white;
          color: #667eea;
          text-decoration: none;
          border-radius: 50px;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}