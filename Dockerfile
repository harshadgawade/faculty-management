# Step 1: JDK 17 base image (Maven build stage)
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app

# Step 2: Project files copy karein
COPY . .

# Step 3: Executable permissions aur Maven wrapper build
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# Step 4: Final runtime image (Lightweight JRE)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Step 5: Generated JAR file copy karein
COPY --from=build /app/target/*.jar app.jar

# Step 6: Application Port expose karein
EXPOSE 8080

# Step 7: Application execution command
ENTRYPOINT ["java", "-jar", "app.jar"]
