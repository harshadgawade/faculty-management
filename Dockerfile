# Step 1: Maven + JDK 17 base image (Maven pre-installed hai)
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app

# Step 2: Project code copy karein
COPY . .

# Step 3: Direct 'mvn' command se build karein
RUN mvn clean package -DskipTests

# Step 4: Final lightweight JRE runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Step 5: Target folder se JAR file copy karein
COPY --from=build /app/target/*.jar app.jar

# Step 6: Application Port expose karein
EXPOSE 8080

# Step 7: Application execution
ENTRYPOINT ["java", "-jar", "app.jar"]
