# How to Test Performance

This guide provides step-by-step instructions for testing the performance of the Document Summarization Application.

## Prerequisites

Before you begin, ensure that you have the following prerequisites:
- The Document Summarization Sample Application is set up and running. Refer to the [Get Started](./get-started.md) guide for setup instructions.

## Steps to Test Performance

1. **Set Up Performance Testing Tools**:
    - Install necessary performance testing tools such as Apache JMeter or Locust:
      ```bash
      pip install locust
      ```

2. **Create a Performance Test Script**:
    - Create a performance test script to simulate user queries. For example, using Locust:
      ```python
      from locust import HttpUser, task, between

      class DocSumPerformanceTest(HttpUser):
      wait_time = between(1, 5)

      @task
      def summarize_document(self):
        # Prepare a sample text file to upload
        files = {
            "file": ("test.txt", "This is a sample document content.", "text/plain")
        }
        data = {
            "query": "Summarize the document"
        }
        self.client.post("/v1/docsum/summarize/", files=files, data=data)
      ```

3. **Run the Performance Test**:
    - Run the performance test script:
      ```bash
      locust -f performance_test.py --host http://<host-ip>:<port-no>
      ```
      The port number will depend based on if it is docker compose based deployment or Helm based deployment.

4. **Monitor Performance Metrics**:
    - Monitor key performance metrics such as latency and throughput using the performance testing tool's dashboard. Accordingly provide the right port number. For docker compose, the port number is `8090` (Nginx Port).

## Key Performance Metrics

### Latency

- **Definition**: The time taken to generate a response to a user query.
- **Measurement**: Measure the response time for each query during the performance test.

### Throughput

- **Definition**: The number of queries processed per second.
- **Measurement**: Measure the number of queries processed per second during the performance test.

## Verification

- Ensure that the application meets the expected performance criteria by analyzing the performance test results.

## Troubleshooting

- If you encounter any issues during the performance testing process, check the application logs for errors:
  ```bash
  docker compose logs
  ```

