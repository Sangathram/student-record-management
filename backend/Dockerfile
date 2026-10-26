# Multi-stage Dockerfile for Spring Boot Student Record Backend
# Stage 1: Build the JAR with Maven
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build production JAR including PostgreSQL driver profile
RUN mvn clean package -Ppostgres -DskipTests

# Stage 2: Minimal, secure JRE runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Run as dedicated unprivileged user
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring

# Copy compiled JAR from build stage (verified artifact name)
COPY --from=builder /build/target/student-record-backend-1.0.0.jar app.jar

# Render assigns PORT dynamically; default fallback is 8080
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
