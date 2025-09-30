export const WorkExperienceCard = ({ experience } : any) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{experience.title}</h3>
          <p className="text-gray-600 font-medium">{experience.company}</p>
        </div>
        {experience.period && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {experience.period}
          </span>
        )}
      </div>
      
      {/* Bullet Points */}
      {experience.points && experience.points.length > 0 && (
        <div className="mt-3">
          <ul className="space-y-2">
            {experience.points.map((item : any, index : any) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <p className="text-gray-700 text-sm leading-relaxed">{item.point}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
