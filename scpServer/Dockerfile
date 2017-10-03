FROM debian:jessie

RUN apt-get update \
  && apt-get install -y openssh-server rssh \
  && rm -rf /etc/ssh/ssh_host_* \
  && mkdir /var/run/sshd && chmod 0755 /var/run/sshd \
  && echo "allowscp" >> /etc/rssh.conf

Entrypoint []
