FROM ubuntu:18.04

ENV HOME=/root WORKDIR=/var/www/html/work TMP=/tmp
ENV TERM xterm


# Update and install package
RUN apt-get update -y \
    && apt-get install -y init wget
WORKDIR $TMP
RUN wget https://dl.google.com/go/go1.11.linux-amd64.tar.gz \
    && tar xvf go1.11.linux-amd64.tar.gz \
    && chown -R root:root ./go \
    && mv go /usr/local

COPY . $WORKDIR
WORKDIR $WORKDIR

# Export port
EXPOSE 80 443
RUN cp $WORKDIR/docker-entrypoint.sh /entrypoint.sh
RUN echo 'export PATH=$PATH:/usr/local/go/bin:$GOPATH/bin' >> ~/.bashrc
# RUN source ~/.bashrc
ENTRYPOINT ["/entrypoint.sh"]
CMD ["-production"]
