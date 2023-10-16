apt update
apt install unzip -y
# apt install language-pack-zh-hans-base  language-pack-zh-hans -y

# sudo dpkg-reconfigure --force locales

# Using Ubuntu
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

wget https://github.com/hello-world-1989/proxy/archive/refs/heads/main.zip

unzip main.zip
cd proxy-main

npm install

echo "export PORT=80" >> ~/.bashrc
source ~/.bashrc