FROM node:20-alpine AS frontend-build
WORKDIR /app/dashboard
COPY dashboard/package.json .
RUN npm install
COPY dashboard/ .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml .
COPY src/ src/
RUN pip install -e ".[server]"
COPY --from=frontend-build /app/dashboard/dist ./dashboard/dist
COPY migrations/ migrations/

EXPOSE 8000
CMD ["uvicorn", "ragaxis.server.main:app", "--host", "0.0.0.0", "--port", "8000"]
