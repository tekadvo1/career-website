const resumeText = `RAKESH VEJENDLA 
rakeshvejendla333@gmail.com | +1 660-528-1315 | https://www.linkedin.com/in/vejendlarakesh  | https://github.com/rakeshvejendla333 | https://www.rakeshvejendla.com 

PROFESSIONAL SUMMARY
AI-Focused Full Stack Engineer with hands-on experience building production-ready web and mobile applications using React, React Native (Expo), Node.js, FastAPI, and cloud platforms including Azure and Railway. Experienced in developing AI-powered applications integrating LLM APIs, real-time workflows, and scalable backend systems. Proven ability to deliver end-to-end solutions from system design and API architecture to deployment and performance optimization in Agile environments. Strong background working across U.S.-based startup and research environments delivering secure, user-focused products.

Education
Master's Degree in Information Systems
Northwest Missouri State University – Maryville, MO 
May 2023 – Jul 2024
Bachelor's Degree in Information Technology 
QIS College of Engineering & Technology – Ongole, India 
May 2017 – Aug 2021

PROFESSIONAL EXPERIENCE
AI Application Engineer, Tek Advo Inc – Remote
Nov 2025 – Present
•	Leading end-to-end development of cross-platform mobile and web applications using React.js, React Native (Expo), Node.js, FastAPI, and MySQL, delivering production-ready solutions across Android, iOS, and web platforms.
•	Architected scalable backend APIs using Node.js and Express.js, implementing authentication workflows, RBAC authorization, and secure data validation practices.
•	Designed and deployed applications on Railway cloud infrastructure, managing environment configuration, database connectivity, and CI-based production deployments.
•	Developed and integrated AI-powered applications using LLM APIs, enabling conversational assistants, automated response generation, and intelligent workflow automation.
•	Built FindStreak.com job portal platform, implementing candidate workflows, employer dashboards, authentication systems, and scalable database architecture using React and Node.js.
•	Implemented real-time application features using REST APIs and asynchronous processing to support dynamic user workflows.
•	Optimised backend performance through structured database queries and caching strategies improving API response efficiency.
•	Managed GitHub version control workflows including branching strategy, code reviews, and release management.
•	Ensured responsive UI/UX across devices and platforms while maintaining performance and accessibility standards.
•	Collaborated with cross-functional stakeholders during product planning, testing, and release cycles following Agile methodologies.

Full Stack Intern, Nebraska Innovation Labs – Omaha, NE                                                       
Jan 2025 – Oct 2025
•	Designed and developed full-stack web applications using React.js, Redux, Node.js, Express.js, and MySQL, enabling complete end-to-end user workflows for internal operational teams.
•	Improved backend performance by implementing Redis caching mechanisms, reducing redundant database queries and improving API response times by approximately 40%.
•	Built real-time communication features using WebSockets, enabling live session tracking and instant messaging support within internal applications.
•	Developed secure admin dashboards using React Table and Tailwind CSS, providing real-time user management and configurable system controls.
•	Implemented Role-Based Access Control (RBAC) and dynamic menu authorization, strengthening application security and improving user-specific navigation workflows.
•	Designed automated audit logging using MySQL triggers to capture INSERT, UPDATE, and DELETE operations, improving compliance tracking and system transparency.
•	Structured backend architecture using layered Express.js design patterns (controllers, services, models) to improve maintainability and scalability.
•	Led REST API testing and documentation using Postman and GitHub workflows supporting collaborative Agile development cycles.
•	Implemented middleware validation and sanitization techniques preventing SQL Injection and XSS vulnerabilities.
•	Automated development workflows using environment-based configuration (.env), database migration scripts, and startup optimization processes reducing manual deployment effort.

Research Assistant, Northwest Missouri State University – Maryville, MO
Aug 2023 – Jun 2024
•	Designed and deployed AI-powered chatbot systems using React.js, Python (FastAPI), and OpenAI-compatible LLM APIs, enabling intelligent, context-aware learning interactions.
•	Built backend services for conversational AI workflows including request routing, prompt structuring, response validation, and error handling.
•	Integrated Large Language Models (LLMs) for real-time query understanding, structured output generation, and contextual response management.
•	Deployed scalable AI services on Microsoft Azure, optimizing cloud resource allocation and reducing infrastructure costs by approximately 15%.
•	Implemented RESTful APIs enabling seamless communication between frontend chatbot interfaces and backend AI processing layers.
•	Designed responsive UI components with structured validation to enhance accessibility and user engagement across desktop and mobile devices.
•	Documented system architecture, API flows, and AI interaction models to support reproducibility and collaborative research development.
•	Participated in Agile sprint cycles, Git-based version control workflows, and cross-functional academic collaboration.


Software Developer, Perigord Life Science Solutions – Hyderabad, India
Aug 2021 – Mar 2023
•	Developed enterprise web application modules using Angular, HTML5, CSS3, and Bootstrap, improving UI responsiveness and cross-browser compatibility for global pharmaceutical clients.
•	Integrated frontend workflows with backend services built using C# and .NET Core APIs, ensuring seamless data exchange and reliable application performance.
•	Optimized complex SQL Server queries and stored procedures, improving data retrieval efficiency and reducing application load times by approximately 30%.
•	Diagnosed and resolved UI defects including formatting inconsistencies, encoding issues, and layout failures, improving internationalization support and user experience.
•	Developed dynamic form validations, reusable Angular services, and automated dropdown workflows reducing manual data entry errors.
•	Automated document generation processes using string manipulation logic and conditional workflows, significantly reducing turnaround time for client deliverables.
•	Supported Agile sprint execution including bug tracking and change request workflows using JIRA and Azure DevOps.
•	Assisted deployment of test builds to Microsoft Azure environments, monitoring application logs and supporting QA validation activities.
•	Participated in peer code reviews and collaborated with QA and product teams to maintain clean, maintainable code standards.

Intern, Gavita Soft Web Designing Services – India
Aug 2020 – Aug 2021
•	Developed and maintained responsive client websites using HTML5, CSS3, JavaScript, and WordPress, ensuring cross-browser compatibility and mobile responsiveness.
•	Customized WordPress themes and plugins to support client branding requirements and dynamic content management workflows.
•	Collaborated with senior developers to implement UI enhancements and optimize website performance and page load efficiency.
•	Assisted in integrating SEO best practices including metadata structuring and Google Business Profile optimization to improve online visibility.
•	Designed reusable web components and layout structures aligned with business and marketing requirements.
•	Supported content deployment and website updates across multiple client projects following delivery timelines.
•	Worked closely with cross-functional teams including developers and marketing stakeholders to align technical implementation with campaign objectives.`;

const jobsIndex = resumeText.indexOf('Software Developer, Perigord');
console.log('Total characters:', resumeText.length);
console.log('Perigord job starts at character:', jobsIndex);
console.log('Gavita job starts at character:', resumeText.indexOf('Intern, Gavita Soft'));
