FROM python:3.10-slim
WORKDIR /app

# 1. पहले सिर्फ requirements.txt लाएं
COPY requirements.txt .

# 2. हैवी पैकेजेस इंस्टॉल करें (यह कैश हो जाएगा)
RUN pip install --no-cache-dir -r requirements.txt

# 3. अब बाकी Python फाइलें कॉपी करें
COPY . .

CMD ["python", "main.py"]
