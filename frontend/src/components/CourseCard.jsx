import { Link } from 'react-router-dom'

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
      <img
        src={course.thumbnail || 'https://placehold.co/400x200?text=Course'}
        alt={course.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
          {course.category}
        </span>
        <h3 className="text-lg font-semibold mt-2 mb-1 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          By {course.instructor?.name || 'Instructor'}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-yellow-500 font-medium">
            ⭐ {course.averageRating || 'N/A'}
          </span>
          <span className="text-blue-700 font-bold">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </span>
        </div>
        <Link
          to={`/courses/${course._id}`}
          className="block mt-3 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          View Course
        </Link>
      </div>
    </div>
  )
}

export default CourseCard