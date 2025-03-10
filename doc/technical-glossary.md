# Technical Glossary

This glossary contains technical terms commonly used at OSBR. Understanding these terms is essential for effective communication with team members and clients.

[[TOC]]

## Development Concepts

### Ubiquitous Language
A common language shared by all team members, including developers and non-technical stakeholders, to describe the domain model and business processes.

### DI (Dependency Injection)
A design pattern where an object receives other objects it depends on rather than creating them internally.

### Currying
A technique in functional programming where a function with multiple arguments is transformed into a sequence of functions, each taking a single argument.

### DiP (Dependency Inversion Principle)
A design principle stating that high-level modules should not depend on low-level modules; both should depend on abstractions.

### IaC (Infrastructure as Code)
The practice of managing and provisioning computing infrastructure through machine-readable definition files rather than physical hardware configuration.

### DSL (Domain Specific Language)
A programming language specialized for a particular application domain.

### Generics
A programming feature that allows types to be parameters when defining classes, interfaces, and methods.

### Clean Architecture
A software design philosophy that separates concerns and dependencies to create maintainable, testable, and adaptable systems.

### Immutable Infrastructure
An approach where infrastructure components are never modified after deployment; instead, they are replaced with new components when changes are needed.

## Web & Cloud Technologies

### Authority DNS Server
A DNS server that holds the original source files for a domain's DNS records.

### Virtual DOM
A programming concept where a virtual representation of a UI is kept in memory and synced with the real DOM by libraries like React.

### JWT (JSON Web Token)
A compact, URL-safe means of representing claims to be transferred between two parties.

### WAF (Web Application Firewall)
A firewall that monitors, filters, and blocks HTTP/HTTPS traffic to and from a web application.

### Load Balancer
A device that distributes network or application traffic across multiple servers to ensure no single server becomes overwhelmed.

### CDN (Content Delivery Network)
A geographically distributed network of proxy servers designed to provide high availability and performance by distributing service spatially relative to end-users.

### Edge Computing
A distributed computing paradigm that brings computation and data storage closer to the sources of data.

### CSP (Content Security Policy)
A security standard that helps prevent cross-site scripting (XSS) and other code injection attacks.

### Serverless Architecture
A software design pattern where applications run in stateless compute containers that are event-triggered and fully managed by a third party.

### NoSQL
A non-relational database design that provides mechanisms for storage and retrieval of data modeled in means other than the tabular relations used in relational databases.

## Programming Paradigms

### Formal Method
A technique used to model complex systems as mathematical entities to verify program correctness through mathematical proofs.

### Tool Calling
The capability of AI models to use external tools or APIs to complete tasks.

### Refinement Type
A type system feature that allows adding a logical predicate to a type, restricting the set of values that belong to the type.

### Dependent Type
A type system where the definition of a type depends on a value.

### Brand Type
A technique in TypeScript using nominal typing to create unique types that are incompatible with structurally identical types.

### Polymorphism
The ability of different objects to respond in a unique way to the same message or method invocation.

### Encapsulation (Capsulize)
The bundling of data and methods that operate on that data within a single unit, and restricting access to some of the object's components.

### Scope
The context in which a variable is defined and can be accessed.

### Closure
A function that has access to its own scope, the scope of the outer function, and global variables.

### Nominal Typing
A type system where types are considered compatible only if they are declared to be so, regardless of having identical structures.

### Structural Subtyping
A type system where compatibility and equivalence are determined by the type's actual structure or definition rather than by explicit declarations.

### Value Object
An immutable object that is distinguishable only by the state of its attributes.

## Authentication & Security

### OAuth (Open Authorization)
An open standard for token-based authentication and authorization.

### OIDC (OpenID Connect)
An identity layer built on top of the OAuth 2.0 protocol that allows clients to verify the identity of the end-user.

### REST (Representational State Transfer)
An architectural style for designing networked applications that use HTTP methods.

### RPC (Remote Procedure Call)
A protocol that one program can use to request a service from a program located on another computer without having to understand network details.

### LSP (Language Server Protocol)
A protocol used between a code editor or IDE and a language server that provides language-specific features like auto-completion and error checking.

### TDD (Test-Driven Development)
A software development process relying on software requirements being converted to test cases before software is fully developed.

### ACL (Access Control List)
A list of permissions associated with an object, specifying which users or system processes are granted access to objects, as well as what operations are allowed on given objects.

### RBAC (Role-Based Access Control)
A method of restricting network access based on the roles of individual users within an enterprise.

### XSS (Cross-Site Scripting)
A type of security vulnerability found in web applications that allows attackers to inject client-side scripts into web pages viewed by other users.

### CSRF (Cross-Site Request Forgery)
An attack that forces an end user to execute unwanted actions on a web application in which they're currently authenticated.

### SQLi (SQL Injection)
A code injection technique used to attack data-driven applications by inserting malicious SQL statements into entry fields.

### OS Command Injection
A security vulnerability that allows an attacker to execute arbitrary operating system commands on the server that is running an application.

## Database Concepts

### DB Schema Migration
The management of incremental, reversible changes to relational database schemas.

### DB Transaction
A unit of work performed within a database management system that is treated in a coherent and reliable way.

### DB Transaction Isolation Level
The degree to which a transaction must be isolated from the data modifications made by other transactions.

### Foreign Key (Restriction)
A field that refers to the primary key in another table, enforcing referential integrity.

### DB Index
A data structure that improves the speed of data retrieval operations on a database table.

### EAV (Entity-Attribute-Value)
A data model to describe entities where the number of attributes is potentially large, but the number actually used by a given entity is relatively modest.

### Shotgun Index
A database indexing strategy where multiple columns are indexed together to optimize specific queries.

### Full Text Search
A technique for searching a document or a collection of documents electronically, in a full text database.

### DB Session
A sequence of interaction between a database client and a database server, typically from login to logout time.

### DB View
A virtual table based on the result-set of an SQL statement.

### Read Replica
A copy of a database instance that reflects the same data as the primary instance but only allows read operations.

### Sharding
A database architecture pattern related to horizontal partitioning where rows of a database table are stored in multiple database nodes.

### Soft Delete
A pattern where data is marked as deleted rather than being physically removed from a database.

## Infrastructure & DevOps

### Container Virtualization
Technology that allows you to package and isolate applications with their entire runtime environment.

### Container Orchestration
The automated arrangement, coordination, and management of software containers.

### ADR (Architecture Decision Record)
A document that captures a decision made about the architecture of a software project.

### Reversible/Irreversible Encryption
Categories of encryption where data can (reversible) or cannot (irreversible) be decrypted back to its original form.

### Technical Debt
The implied cost of additional rework caused by choosing an easy solution now instead of using a better approach that would take longer.

### Agile
A set of principles for software development that values adaptability and collaboration.

### Scrum
An agile framework for developing, delivering, and sustaining complex products through iterative, incremental work cycles called sprints.

### CI/CD (Continuous Integration/Continuous Deployment)
A method to frequently deliver apps to customers by introducing automation into the stages of app development.

### SRE (Site Reliability Engineering)
A discipline that incorporates aspects of software engineering and applies them to infrastructure and operations problems.

### Proxy / Reverse Proxy
A server that acts as an intermediary between clients and servers, with a reverse proxy accepting requests on behalf of a server.

### Blue-Green Deployment
A technique that reduces downtime and risk by running two identical production environments called Blue and Green.

### DNS TTL (Time To Live)
Specifies how long a resolver is supposed to cache the DNS record before the resolver tries to refresh it.

### TTFB (Time To First Byte)
A measurement used as an indication of the responsiveness of a web server or other network resource.

### Latency
The time delay between the cause and the effect of some physical change in the system being observed.

### SPOF (Single Point Of Failure)
A part of a system that, if it fails, will stop the entire system from working.

## Programming Languages & Tools

### UML (Unified Modeling Language)
A standardized modeling language consisting of an integrated set of diagrams for visualizing, specifying, constructing, and documenting the artifacts of a software system.

### ER Chart (Entity-Relationship Chart)
A data modeling technique that graphically illustrates an information system's entities and the relationships between those entities.

### ORM (Object-Relational Mapping)
A programming technique for converting data between incompatible type systems using object-oriented programming languages.

### MVC (Model-View-Controller)
A software design pattern commonly used for developing user interfaces that divides the related program logic into three interconnected elements.

### POSIX (Portable Operating System Interface)
A family of standards for maintaining compatibility between different operating systems.

### RFC (Request for Comments)
A formal document from the Internet Engineering Task Force that describes the specifications for a particular technology.

### SSH (Secure Shell)
A cryptographic network protocol for operating network services securely over an unsecured network.

### SSL/TLS (Secure Sockets Layer/Transport Layer Security)
Cryptographic protocols designed to provide communications security over a computer network.

### SFTP (SSH File Transfer Protocol)
A network protocol that provides file access, file transfer, and file management over any reliable data stream.

### Job Queue
A data structure maintained by a job scheduler that contains jobs to run.

### Decision Tree
A flowchart-like structure in which each internal node represents a test on an attribute, each branch represents the outcome of the test, and each leaf node represents a class label.

### Genetic Algorithms
A search heuristic that reflects the process of natural selection in optimization problems.

### Higher Order Function
A function that takes one or more functions as arguments or returns a function as its result.

### Turing Complete
A system capable of performing any computation that can be described algorithmically.

### Object Storage
A data storage architecture that manages data as objects, as opposed to file systems or block storage.

### NFS (Network File System)
A distributed file system protocol that allows a user on a client computer to access files over a network.

### LocalStorage
A web browser API that allows JavaScript websites and apps to store data persistently across browser sessions.

### C10k Problem
The problem of optimizing network sockets to handle a large number of clients simultaneously.

### Isomorphic JavaScript
JavaScript code that can run both on the client and server sides.

### WebSocket
A communication protocol providing full-duplex communication channels over a single TCP connection.

### WebRTC (Web Real-Time Communication)
A free, open-source project providing web browsers and mobile applications with real-time communication via simple APIs.

### Embedded Language
A programming language designed to be embedded within another programming language or application.

### Port Scanning
A process that sends client requests to a range of server port addresses on a host to find an active port.

### Modal / Modeless
User interface elements that either require user interaction before continuing (modal) or allow continued interaction elsewhere (modeless).

### Responsive Web Design
A web design approach that makes web pages render well on a variety of devices and window or screen sizes.

### Atomic Design
A methodology for creating design systems by breaking down interfaces into fundamental components that can be combined to create more complex ones.

### Prompt Engineering
The process of designing and refining input prompts to AI systems to achieve desired outputs.

### x86
A family of instruction set architectures initially developed by Intel based on the Intel 8086 microprocessor.

### ARM (Advanced RISC Machines)
A family of reduced instruction set computing (RISC) architectures for computer processors.

### Package Manager
A tool that automates the process of installing, upgrading, configuring, and removing computer programs.

### Compiler
A program that translates source code from a high-level programming language to a lower level language.

### Interpreter
A computer program that directly executes instructions written in a programming or scripting language.

### Result (Either)
A functional programming pattern representing a value that could be one of two types, typically used for error handling.

### Option (Maybe)
A functional programming pattern representing a value that might be present or might be absent.

### Promise (Async/Await)
A proxy for a value not necessarily known when the promise is created, allowing for asynchronous operations.

### CORS (Cross-Origin Resource Sharing)
A mechanism that allows restricted resources on a web page to be requested from another domain outside the domain from which the first resource was served.

### Side Effect
A change in state or interaction with the outside world that occurs during the calculation of a result.

### SAT/SMT (Satisfiability/Satisfiability Modulo Theories)
Problem-solving techniques used in formal verification, especially for hardware and software systems.

### Garbage Collection
Automatic memory management that reclaims memory occupied by objects that are no longer in use by the program.

### Open Telemetry
A collection of tools, APIs, and SDKs used to instrument, generate, collect, and export telemetry data for analysis.

## Web Development

### JSON (JavaScript Object Notation)
A lightweight data-interchange format that is easy for humans to read and write and for machines to parse and generate.

### YAML (YAML Ain't Markup Language)
A human-readable data serialization language commonly used for configuration files.

### OpenAPI
A specification for machine-readable interface files for describing, producing, consuming, and visualizing RESTful web services.

### Symbolic Link
A file that contains a reference to another file or directory.

### Hot Reloading
A feature that allows a developer to see code changes in real-time without refreshing the application.

### Static Analysis
The process of analyzing code without executing it to find potential bugs, ensure adherence to coding guidelines, and security vulnerabilities.

### Ternary Operator
A conditional operator that takes three operands and is a shorthand for if-then-else statements.

### Over Engineering
The act of designing a product to be more robust or complicated than is necessary for its application.

### Print Debugging
The practice of adding print statements to a program for debugging purposes.

### OCR (Optical Character Recognition)
The electronic or mechanical conversion of images of typed, handwritten or printed text into machine-encoded text.

### Markdown
A lightweight markup language with plain text formatting syntax designed to be converted to HTML and other formats.

### Sequence Chart
A diagram that shows object interactions arranged in time sequence.

### State Machine Chart
A diagram that describes the states an object can have, the events that cause a transition from one state to another, and the actions that result from a state change.

### Activity Chart
A diagram that depicts high-level business processes, including data flow.

### Grid Layout
A CSS layout system that divides a page into major regions or defining the relationship in terms of size, position, and layer between parts of a control built from HTML primitives.

### Flex Layout
A CSS layout system that provides a more efficient way to lay out, align, and distribute space among items in a container.

### Breaking Changes
Changes to a software interface that affect backward compatibility, potentially causing existing dependent code to fail.

### SSR (Server-Side Rendering)
The process of rendering web pages on the server and sending the fully rendered page to the client.

### SPA (Single Page Application)
A web application that loads a single HTML page and dynamically updates that page as the user interacts with the app.

### DFS/BFS (Depth-First Search/Breadth-First Search)
Graph traversal algorithms: DFS explores as far as possible along each branch before backtracking, while BFS explores all neighbor nodes at the present depth before moving to nodes at the next depth level.

### i18n (Internationalization)
The process of designing a software application so that it can be adapted to various languages and regions without engineering changes.

### a11y (Accessibility)
The design of products, devices, services, or environments for people with disabilities.

### Fingerprinting
A technique, mainly used in digital rights management systems, for identifying digital media by comparing digital signals.

### CPU Steal Time
A metric for virtualized environments representing the time that the virtual CPU waits for a real CPU while the hypervisor is servicing another virtual processor.

### HTTP Status Codes
Standard response codes given by web site servers on the Internet, with different ranges (2xx - success, 3xx - redirection, 4xx - client errors, 5xx - server errors).

### HTTP Methods
Standard methods for HTTP requests (GET, POST, PUT, PATCH, DELETE, etc.).

### History API
A browser API that allows manipulation of the browser session history.

### Primary Key
A unique identifier for a record in a database table.

### Web Scraping
The process of collecting structured web data in an automated fashion.

### Bitmap Image
A raster image file format used to store digital images, composed of a matrix of pixels.

### Vector Image
An image file format that uses geometric formulas to represent images rather than pixel data.

## Business & Project Management

### DMG (Disk Image)
A disk image file that contains the contents and structure of a disk volume or an entire data storage device.

### Bastion Host
A special-purpose computer on a network specifically designed and configured to withstand attacks.

### Region, AZ (Availability Zone), VPC (Virtual Private Cloud), Subnet
Concepts in cloud infrastructure: regions are separate geographic areas, AZs are isolated locations within a region, VPCs are logically isolated sections of the cloud, and subnets are ranges of IP addresses in your VPC.

### IP Exhaustion
The depletion of the pool of unallocated IPv4 addresses.

### Micro Frontend Architecture
An architectural style where frontend applications are decomposed into individual, semi-independent micro applications.

### Monorepo
A software development strategy where multiple projects are stored in a single repository.

### Rate Limit
A strategy for limiting network traffic, commonly used to prevent abuse.

### PMBOK (Project Management Body of Knowledge)
A set of standard terminology and guidelines for project management.

### ITIL (Information Technology Infrastructure Library)
A set of detailed practices for IT service management.

### ISMS (Information Security Management System)
A set of policies and procedures for systematically managing an organization's sensitive data.

### QMS (Quality Management System)
A formalized system that documents processes, procedures, and responsibilities for achieving quality policies and objectives.

### CoC (Code of Conduct)
A set of rules outlining the norms, rules, and responsibilities or proper practices of an individual party or organization.

### C2C, B2B, B2C
Business models: Consumer-to-Consumer, Business-to-Business, Business-to-Consumer.

### SEO (Search Engine Optimization)
The process of improving the quality and quantity of website traffic by increasing visibility of a website or a web page to users of a web search engine.

### Consumer Generated Services
Online services where content is primarily created by the users rather than the service providers.

### CGI (Common Gateway Interface)
A standard protocol for web servers to execute programs that execute like console applications running on a server that generates web pages dynamically.

### Inheritance
A mechanism in object-oriented programming where a class inherits properties and behaviors from another class.

### Content Marketing
A form of marketing focused on creating, publishing, and distributing content for a targeted audience online.

### DevOps
A set of practices that combines software development (Dev) and IT operations (Ops) to shorten the system development life cycle.

### Burn Up/Down Chart
Project management tools that show work completed against the total amount of work and time remaining.

### Person-Day
A unit of measurement representing the work one person can produce in a day.

### On-Call Shift
A work arrangement where employees are available to work on short notice if the need arises.

### Open Question
A question that cannot be answered with a simple "yes" or "no" response.

### Directive Thinking
A structured approach to thinking that focuses on achieving specific goals or outcomes.

### HRT (Honest, Respectful, Trustworthy)
A framework for effective communication and collaboration.

### KYC/eKYC (Know Your Customer/Electronic Know Your Customer)
The process of verifying the identity of customers, with eKYC doing so through digital means.

### Talent Management
The anticipation of required human capital and the planning to meet those needs.

## Miscellaneous Technical Terms

### UUID (Universally Unique Identifier)
A 128-bit number used to identify information in computer systems.

### Float/Double/Decimal
Numeric data types for representing real numbers with varying precision.

### Floating-Point Arithmetic Error
Inaccuracies that occur when computers perform calculations on floating-point numbers.

### Passkey
A security technology that replaces traditional passwords with public-private key pairs.

### MFA (Multi-Factor Authentication)
An authentication method requiring users to provide two or more verification factors to gain access.

### Static Method/Class Method
Methods that belong to the class rather than instances of the class, with class methods having access to the class they belong to.

### Environment Variable
A variable whose value is set outside the program, typically through the operating system functionality.

### Secret Store
A secure location for storing sensitive information like API keys, passwords, and certificates.

### Clickjacking
A malicious technique of tricking a user into clicking on something different from what the user perceives.

### Data Masking
The process of hiding original data with modified content to protect sensitive information.

### OSI Reference Model
A conceptual model that characterizes and standardizes the communication functions of a telecommunication or computing system.

### TCP (Transmission Control Protocol)
A connection-oriented, reliable data delivery protocol in computer networking.

### UDP (User Datagram Protocol)
A connectionless, less reliable but faster data delivery protocol in computer networking.

### CMS (Content Management System)
Software that allows users to create, manage, and modify content on a website without specialized technical knowledge.

### Micro CMS
A minimalist CMS focused on content creation and delivery rather than full website management.

### SSO (Single Sign-On)
An authentication scheme that allows a user to log in with a single ID and password to any of several related, yet independent, software systems.

### Scale Up/Down
The process of adding/removing resources to a single node in a system.

### Scale Out/In
The process of adding/removing nodes to a system, typically a distributed system.

### Throughput
The amount of data moved successfully from one place to another in a given time period.

### Desktop Virtualization
A software technology that separates the desktop environment and associated application software from the physical client device.

### Packet
A formatted unit of data carried by a packet-switched network.

### Failover
The capability to switch over automatically to a redundant or standby system upon the failure of the previously active system.

### OTP (One-Time Password)
A password that is valid for only one login session or transaction.

### AJAX (Asynchronous JavaScript and XML)
A technique used in web development to create asynchronous web applications.

### BCP (Business Continuity Planning)
The process of creating systems of prevention and recovery to deal with potential threats to a company.

### ASP (Application Service Provider)
A business that provides computer-based services to customers over a network.

### BYOD (Bring Your Own Device)
A policy allowing employees to bring personally owned devices to their workplace and use them to access company information and applications.

### DaaS (Desktop as a Service)
A cloud computing offering where a third party hosts the back end of a virtual desktop infrastructure deployment.

### DDoS (Distributed Denial of Service)
A malicious attempt to disrupt normal traffic of a targeted server, service or network by overwhelming the target with a flood of Internet traffic.

### VPN (Virtual Private Network)
A technology that creates a safe and encrypted connection over a less secure network.

### VPS (Virtual Private Server)
A virtual machine sold as a service by an Internet hosting service.

### GraphQL
A query language for APIs and a runtime for executing those queries with existing data.

### Bundling
The process of gathering and combining multiple files into a single file.

### Let's Encrypt
A free, automated, and open certificate authority providing free TLS/SSL certificates.

### Cron
A time-based job scheduler in Unix-like operating systems.

### Web Font
A CSS feature that allows the use of fonts that are not installed on the user's computer.

### Kernel
The core of a computer's operating system with complete control over everything in the system.

### Morphological Analysis
A technique in NLP and linguistics for analyzing the structure of words.

### Macro
A saved sequence of commands or keyboard strokes that can be stored and recalled with a single command or keyboard stroke.

### BI (Business Intelligence)
Strategies and technologies used by enterprises for data analysis and information gathering.

### Enum (Enumeration)
A data type consisting of a set of named values called elements, members, or enumerators of the type.

### Union Type
A type formed from two or more other types, representing values that may be any one of those types.

### ETL (Extract, Transform, Load)
A process in database usage that extracts data from various sources, transforms it to fit operational needs, and loads it into an end target database.

### DOM (Document Object Model)
A programming interface for web documents that represents the page so that programs can change the document structure, style, and content.

### UTF-8/Shift-JIS/EUC-JP
Character encodings: UTF-8 is a variable-width character encoding for Unicode, Shift-JIS and EUC-JP are primarily used for Japanese characters.

### No Code/Low Code
Development platforms that allow the creation of software applications through graphical user interfaces and configuration instead of traditional hand-coded programming.

### Protocol Buffer
A method developed by Google to serialize structured data.

### WebView
A browser bundled inside of a mobile application producing web application-like results.

### Sudo
A program for Unix-like computer operating systems that allows users to run programs with the security privileges of another user.

### Base64
A group of binary-to-text encoding schemes that represent binary data in an ASCII string format.

### WebAssembly (Wasm)
A binary instruction format for a stack-based virtual machine, designed as a portable target for high-level languages.

### Stateful/Stateless
Terms describing whether a system keeps track of information between sessions (stateful) or not (stateless).

### RegExp (Regular Expression)
A sequence of characters that define a search pattern.

### Gzip
A file format and a software application used for file compression and decompression.

### SSG (Static Site Generator)
A tool that generates a full static HTML website based on raw data and a set of templates.

### reCAPTCHA
A system designed to establish that a computer user is human and not a bot.

### EXIF (Exchangeable Image File Format)
A standard that specifies formats for images, sound, and ancillary tags used by digital cameras and other systems.

### RDBMS (Relational Database Management System)
A type of database management system that stores data in relations (tables).

### Logrotate
A system utility for managing logs on Linux systems by automatically rotating, compressing, and removing them.

### Country Risk
The risk of doing business in a particular country.

### RAG (Retrieval-Augmented Generation)
A technique combining retrieval systems and language models to enhance the factual accuracy of generated content.

### Servant Leadership
A leadership philosophy where the main goal of the leader is to serve others.

### Hindley-Milner Type Inference
A classical type inference algorithm for programming languages with parametric polymorphism.

### Feature Toggle
A technique in software development that allows features to be enabled or disabled without deploying new code.

### RPA (Robotic Process Automation)
Technology that allows automating routine, rule-based tasks through software robots or artificial intelligence.

### Curry-Howard Correspondence
A direct relationship between computer programs and mathematical proofs.

### Serialize/Deserialize
The process of translating a data structure or object state into a format that can be stored or transmitted (serialize) and reconstructed later (deserialize).

### Marshal/Unmarshal
Similar to serialization/deserialization but often refers specifically to converting objects to/from byte sequences.

### Encode/Decode
The process of converting data from one format to another.
