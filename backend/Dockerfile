FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Build with Java 21 LTS in Docker (overrides pom java.version=25)
RUN mvn package -DskipTests -Dmaven.compiler.source=21 -Dmaven.compiler.target=21 -Dmaven.compiler.release=21

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 3000
ENTRYPOINT ["java", "-jar", "app.jar"]
