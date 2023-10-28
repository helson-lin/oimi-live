FROM centos:7
COPY ./dist/oimi-live-linux /app/
COPY ./config-example.yml /app/
WORKDIR /app
CMD mv /app/config-example.yml config.yml
CMD chmod +x oimi-live-linux
EXPOSE 8081

ENTRYPOINT ["./oimi-live-linux"]