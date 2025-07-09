
FROM python:3.9-slim-buster AS builder

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       build-essential \libpq-dev \gcc \python3-dev \
			&& rm -rf /var/lib/apt/lists/*

					
COPY requirements.txt .

	
RUN pip install --no-cache-dir --compile -r requirements.txt

					
FROM python:3.9-slim-buster

WORKDIR /app

					
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages

COPY . .
					
RUN adduser --system --no-create-home appuser
USER appuser
					
EXPOSE 8000

					
CMD ["sh", "-c", "python manage.py migrate --noinput && python -m gunicorn --bind 0.0.0.0:8000 core.wsgi:application"]


