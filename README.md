GlobalSMS接码盗U系统部署

环境准备
Debian 12.10
Nginx 1.24.0
Python 3.11.9


部署教程
1、安装宝塔

2、下载 Python 3.11.9 源码
cd /tmp
wget https://www.python.org/ftp/python/3.11.9/Python-3.11.9.tgz
tar -xf Python-3.11.9.tgz
cd Python-3.11.9
 
3、配置并编译安装
./configure --enable-optimizations --with-ensurepip=install
make -j $(nproc)  # 使用多线程加速编译
sudo make altinstall
 
4、验证安装
python3.11 --version  # 输出 Python 3.11.9
pip3.11 --version     # 输出 pip 版本

5、创建并激活虚拟环境：
# 创建虚拟环境
python3.11 -m venv /www/wwwroot/sms.andong.bio/venv

# 激活虚拟环境
source /www/wwwroot/sms.andong.bio/venv/bin/activate

# 验证虚拟环境（提示符会变化）
(venv) user@host:~$

6、安装程序依赖
pip install -r requirements.txt 

7、初始化数据库
python3 init_database.py

8、导入国家模拟数据
python3 generate_countries.py

9、导入服务模拟数据
python3 generate_services.py

10、关联国家和服务数据
python3 assign_services.py

11、启动程序
前台运行: python3 app.py
后台运行: nohup python3 app.py &

12、反向代理: 127.0.0.1:5000

管理页: /config
默认密码: admin123

乔法克斯温馨提示: 域名建议使用com这些知名后缀，因为某些钱包不是这种后缀他访问会错误。还有记得一定要强制SSL。
有疑问请加Telegram群: @kupof 请教
