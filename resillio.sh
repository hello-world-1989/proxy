wget https://download-cdn.resilio.com/2.7.3.1381/Debian/resilio-sync_2.7.3.1381-1_amd64.deb
dpkg -i  resilio-sync_2.7.3.1381-1_amd64.deb

##auto start
sudo systemctl enable resilio-sync

sudo service resilio-sync restart 


##remove
##sudo apt-get purge resilio-sync

#change config file

##manual operation and revert once changed
#/etc/resilio-sync/config.json

