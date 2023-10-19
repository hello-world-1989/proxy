# apt update
apt install unzip -y
# apt install language-pack-zh-hans-base  language-pack-zh-hans -y


rm -rf proxy-main
rm -rf proxy.zip

wget https://github.com/hello-world-1989/proxy/archive/refs/heads/main.zip
mv main.zip proxy.zip

unzip proxy.zip
cd proxy-main
mkdir public

sudo sh nodesource_setup.sh

# sudo dpkg-reconfigure --force locales

# Using Ubuntu
# sudo snap install node --classic
sudo apt install nodejs -y
node -v
#need reboot

npm install
# npm install -g npm@10.2.1
npm install -g  pm2 typescript

echo "export PORT1=80" >> ~/.bashrc
echo "export PORT2=8080" >> ~/.bashrc
source ~/.bashrc

# -----------------------------------------
tsc ~/proxy-main/src/proxy.ts
pm2 start ~/proxy-main/src/proxy.js -n proxy --time 
pm2 restart proxy




tsc ~/proxy-main/src/web.ts
pm2 start ~/proxy-main/src/web.js -n web --time 
pm2 restart web
# -----------------------------------------


pm2 save
pm2 startup


echo '30 20 * * * root sudo reboot' >> /etc/crontab
sudo service cron start

cd ~

wget https://github.com/hello-world-1989/temp/archive/refs/heads/main.zip

mv main.zip temp.zip
unzip temp.zip

mv temp-main ./proxy-main/public
cp ~/proxy-main/public/temp-main/readme.html ~/proxy-main/public/temp-main/index.html
