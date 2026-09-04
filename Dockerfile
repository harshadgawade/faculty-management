# --- Stage 1: Build Stage ---
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# 1. सिर्फ pom.xml कॉपी करें
COPY pom.xml .

# 2. सिर्फ dependencies डाउनलोड करें (यह स्टेप कैश हो जाएगा!)
RUN mvn dependency:go-offline

# 3. अब बाकी पूरा Java Source Code कॉपी करें
COPY src ./backend/src

# 4. अब प्रोजेक्ट को बिल्ड करें (बिना री-डाउनलोड के बहुत तेज़ी से बिल्ड होगा)
RUN mvn package -DskipTests

# --- Stage 2: Runtime Stage ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Stage 1 से तैयार JAR फाइल कॉपी करें
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
