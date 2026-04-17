import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public pages
import Home from './pages/Home.jsx';
import Articles from './pages/Articles.jsx';
import Article from './pages/Article.jsx';
import Programs from './pages/Programs.jsx';
import Program from './pages/Program.jsx';
import Education from './pages/Education.jsx';
import EducationPage from './pages/EducationPage.jsx';
import Books from './pages/Books.jsx';
import Partners from './pages/Partners.jsx';
import About from './pages/About.jsx';


// Protected Pages
import Dashboard from './pages/Dashboard.jsx';
import CourseLearn from './pages/CourseLearn.jsx';
import Lesson from './pages/Lesson.jsx';

import NotFound from './pages/NotFound.jsx';

const App = () => (
    <Routes>
        <Route element={<Layout />}>
            {/* Public */}
            <Route index element={<Home />} />
            <Route path="articles" element={<Articles />} />
            <Route path="articles/:slug" element={<Article />} />
            <Route path="programs" element={<Programs />} />
            <Route path="programs/:slug" element={<Program />} />
            <Route path="education" element={<Education />} />
            <Route path="education/:slug" element={<EducationPage />} />
            <Route path="books" element={<Books />} />
            <Route path="partners" element={<Partners />} />
            <Route path="about" element={<About />} />
            {/* <Route path="login" element={<Navigate to='/' replace />} />
            <Route path="register" element={<Navigate to='/' replace />} /> */}

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="courses/:slug/learn" element={<CourseLearn />} />
                <Route path="courses/:slug/learn/:lessonId" element={<Lesson />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Route>
    </Routes>
);

export default App;