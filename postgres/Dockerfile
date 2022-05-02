FROM postgres

ADD script.sh /tmp

ENV POSTGRES_USER root
ENV POSTGRES_PASSWORD root
ENV POSTGRES_DB transc

COPY db.sql /docker-entrypoint-initdb.d/

# ENTRYPOINT ["sh", "/tmp/script.sh"]
