---
title: Pentesting SAP
description: Reference for SAP pentests
date: 2025-05-22
---

## Goal

This page is a mix of reference material and brain dump for SAP security audit / pentest.

Special thanks to [@nitbx](https://github.com/nitbx) for training me! I hope to be as good as he is some day.



## OOP

### CLI

Launching SAP GUI

```powershell
&"C:\Program Files (x86)\SAP\FrontEnd\SapGui\SAPgui.exe" "/H/192.168.0.2/S/3201"
```



### Network Reconnaissance

Scan the hosts using https://github.com/gelim/nmap-sap

```bash
nmap -n --open --datadir . -sV -p $(./sap_ports.py) -iL ../hosts.list  --open -oA ../nmap/sap_services
```

Use the MSF module `auxiliary/scanner/sap/sap_service_discovery` 

Take note of the SAP services identified.

**Login screen information retrieval** **(32NN)**

```bash
parallel --col-sep ':' diag_login_screen_info.py -d {1} -p {2}  :::: hosts_v1.list | tee login_screen/output_1
```

**Client ID discovery (bruteforce)**

```bash
diag_login_brute_force.py --discovery --discovery-range 000-999 -d 192.168.224.219
```

How to interpret the error messages:

- **Status: Client does not exist** -> Client ID does not exist
- **Status: E: Name or password is incorrect (repeat logon)** -> Client ID is valid
- **Status: E: Password logon no longer possible - too many failed attempts** -> Account lockout

> [!NOTE]
> If you get 000-999 with the same message, chances are that there is something wrong with the host/service.


**Known SAP URL bruteforce**

Combine the wordlists into a single file

```bash
parallel ffuf -w wordlists/sap.list -u {1}/FUZZ -r -v -of all -o ffuf/{#} :::: pdiscovery/sap_services.httpx
```



## SAP Router

If a host has port 3299 open -> Check if it's running the Router service.

Then use `sap_router_info_request` to get the connection table.

Use `sap_router_portscanner` after.



## Default Credentials

Spray default credentials with 

```bash
diag_login_brute_force.py -p 3200 -d RHOST -c default_sap_credentials --verbose | tee ./default_creds_spray_RHOST_3200.output
```

> [!NOTE]
> https://github.com/OWASP/pysap/blob/master/examples/diag_login_brute_force.py#L214 
> The check is using a static string that is language based. 
> Update the strings is the system is in French



Spray the web interface of SAP GUI with metasploit `scanner/sap/sap_web_gui_brute_login` module.

Default credentials are stored in `sap_default.txt`.



Quick script to run the job with `GNU parallel`

```bash
#!/bin/bash
set -xe

if [[ -z "${1}" ]]
then
    echo "missing host"
    exit 1
fi
host=$1

if [[ -z "${2}" ]]
then
    echo "missing port"
    exit 1
fi
port=$2

mkdir -pv ./brute_output

diag_login_brute_force.py -d "${1}" -p "${2}" -c ./default_sap_credentials --discovery --discovery-range 000-999 --verbose | tee -a "./brute_output/${1}_${2}.output"
```

Run with `parallel --col-sep ':' --jobs 4 ./brute.sh {1} {2} :::: ~/hosts_v1.list`

Hosts file list needs to be in **host:port** format



## Configuration Audit

**Check permissions of user**

- SA38 - ABAP Workbench
- SE16N - User Profile Maintenance
- SU01 - User Master Record
- SU02 - Authorization Data
- PFCG - Transaction Codes



**Security policy settings**

- `/nSA38` with `RSPARAM`
- 

```bash
./ms_dump_param.py -d X.X.X.X -p 32XX  -f audit.txt
```

```
# ./audit.txt
login/min_password_lng:SUP:8					#D
login/fails_to_user_lock:INF:6
login/failed_user_auto_unlock:EQUAL:0
login/fails_to_session_end:INF:4
login/disable_multiple_gui_login:EQUAL:1
login/min_password_diff:SUP:0
login/password_max_idle_initial:NOTEQUAL:0
login/password_max_idle_productive:NOTEGUAL:0
#login/ticket_expiration_time:SUP:0
login/min_password_digits:NOTEGAL:0
login/min_password_letters:NOTEGAL:0
login/min_password_specials:NOTEGAL:0
login/password_history_size:SUP:5
login/password_compliance_to_current_policy:NOTEGAL:0
login/no_automatic_user_sapstar:EQUAL:1
login/min_password_digits:NOTEGAL:0
```







## SAP transactions, reports, function modules and tables with security concerns



|       Code       |                Description                 | User1 | User2 | User3 |
| :--------------: | :----------------------------------------: | ----- | ----- | ----- |
|       AL11       |          Display SAP Directories           |       |       |       |
|    CG3Y, CG3Z    |         Upload and Download files          |       |       |       |
|    DBACOCKPIT    |             Database Interface             |       |       |       |
|       OS04       |         Local System Configuration         |       |       |       |
|       OS05       |        Remote System Configuration         |       |       |       |
|       OS07       |      Remote Operating System Activity      |       |       |       |
|       PFCG       |          Role Maintenance (PFCG)           |       |       |       |
|       RSRT       |               Query Monitor                |       |       |       |
|      RSUDO       |          Execution as Other User           |       |       |       |
|   RZ11 / RZ10    |        SAP Parameters Configuration        |       |       |       |
|    SCC4, SCC5    |           Client Administration            |       |       |       |
|       SCMP       |           Table/View Comparisons           |       |       |       |
|    SE01, SE10    |             CTS / TMS Commands             |       |       |       |
|       SE06       |         Set Up Transport Organizer         |       |       |       |
| SE11, SE12, SE13 |        Table Structure Maintenance         |       |       |       |
|       SE14       |        Table Structure Maintenance         |       |       |       |
|       SE15       |       Repository Information System        |       |       |       |
|       SE16       |               Display Tables               |       |       |       |
|    SE37, SA37    |          Execute Function Module           |       |       |       |
|    SE38, SA38    |               Execute Report               |       |       |       |
|       SE93       |           Maintains Transactions           |       |       |       |
|     SECSTORE     |            Secure Storage Store            |       |       |       |
|       SM01       |         Lock / Unlock Transactions         |       |       |       |
|    SM04, AL08    |            List Connected Users            |       |       |       |
|       SM12       |                Lock Entries                |       |       |       |
|       SM13       |        Administrate Update Records         |       |       |       |
|       SM20       |       Security Audit Log Assessment        |       |       |       |
|       SM21       |         Online System Log Analysis         |       |       |       |
|       SM32       | Updates Table USR40 with Invalid Passwords |       |       |       |
|       SM36       |       Simple Job Selection/Scheduler       |       |       |       |
|       SM37       |      Extended Job Selection/Scheduler      |       |       |       |
|       SM49       |             Execute OS Command             |       |       |       |
|    SM51, SM66    |             List Work Process              |       |       |       |
|       SM52       |     Execute Operating System Commands      |       |       |       |
|       SM59       |       RFC Destination Configuration        |       |       |       |
|       SM69       |           Configure / Execute OS           |       |       |       |
|       SP01       |          Administer Print Spools           |       |       |       |
|       SQVI       |             Table Quickviewer              |       |       |       |
|       ST04       |        Database Performance Monitor        |       |       |       |
|       STMS       |        Transport Management System         |       |       |       |
|       SU01       |               Maintain Users               |       |       |       |
|       SU10       |           User Mass Maintenance            |       |       |       |
|       SU56       |         User Authorization Buffer          |       |       |       |
|       SUIM       |          User Information System           |       |       |       |
|       SXDA       |          Data Transfer Workbench           |       |       |       |
|       SXDB       |          Data Transfer Workbench           |       |       |       |
|    SXDA_TOOLS    |            DX Workbench: Tools             |       |       |       |
|       TU02       |             Parameter Changes              |       |       |       |
|      SE16N       |           General Table Display            |       |       |       |



|       Report        |        Description         | User1 | User2 | User3 |
| :-----------------: | :------------------------: | ----- | ----- | ----- |
|      RSBDCOS0       | OS Shell Command Emulation |       |       |       |
|      RPCIFU01       |      Display OS File       |       |       |       |
|       RPCFU03       |      Download OS File      |       |       |       |
| RS_ABAP_SOURCE_SCAN |    ABAP Source Scanning    |       |       |       |



|               Function module               |                Description                 | User1 | User2 | User3 |
| :-----------------------------------------: | :----------------------------------------: | ----- | ----- | ----- |
|               RFC_READ_TABLE                |                 Read Table                 |       |       |       |
|       OCS_GET_FILE_INFO/ WS_DOWNLOAD        |              Display OS file               |       |       |       |
| SUBST_GET_FILE_LIST/ ISU_M_GET_FILES_OF_DIR |              Download OS file              |       |       |       |
|                RZL_READ_FILE                |            ABAP Source Scanning            |       |       |       |
|              SXPG_CALL_SYSTEM               | Call SAP External Command(i.e. OS Command) |       |       |       |
|            SXPG_COMMAND_EXECUTE             | Call SAP External Command(i.e. OS Command) |       |       |       |
|         ARCHIVFILE_CLIENT_TO_SERVER         |   Upload File from SAPGui to SAP System    |       |       |       |
|         ARCHIVFILE_SERVER_TO_SERVER         |  Transfer File from SAP System to another  |       |       |       |
|          RFC_ABAP_INSTALL_AND_RUN           |        Create and Execute ABAP Code        |       |       |       |
|            WS_EXECUTE / GUI_EXEC            | Execute Program on SAP Client Workstation  |       |       |       |
|             SYSTEM_REMOTE_LOGIN             |       Connection to RFC Destination        |       |       |       |
|           TH_CREATE_FOREIGN_MODE            |       Connection to RFC Destination        |       |       |       |
|                 EPS_FTP_PUT                 |       FTP PUT Command (Upload File)        |       |       |       |
|                 EPS_FTP_GET                 |      FTP GET Command (Download File)       |       |       |       |
|                EPS_FTP_MPUT                 |       FTP MPUT Command (Upload file)       |       |       |       |
|                EPS_FTP_MGET                 |      FTP MGET Command (Download File)      |       |       |       |
|              BAPI_USER_CREATE1              |              Create SAP User               |       |       |       |
|              BAPI_USER_CHANGE               |              Update SAP User               |       |       |       |

|     Table     |                         Description                          | User1 | User2 | User3 |
| :-----------: | :----------------------------------------------------------: | ----- | ----- | ----- |
|     USR01     |                     User Master Records                      |       |       |       |
|     USR02     |                    User IDs and Passwords                    |       |       |       |
|     USH02     |                   Password Change History                    |       |       |       |
|  VUSR02_PWD   |            View Containing User IDs and Passwords            |       |       |       |
|     USR40     |               Non-permissible Password Values                |       |       |       |
|     USR04     |                  User Master Authorizations                  |       |       |       |
|     USR10     |           Authorization Profiles (i.e. &_SAP_ALL)            |       |       |       |
|     USR11     |            User Master Profiles and Descriptions             |       |       |       |
|     USR12     |               User Master Authorization Values               |       |       |       |
| USRPWDHISTORY |               User Login/Password Information                |       |       |       |
|    RFCDES     |                     ABAP Source Scanning                     |       |       |       |
|     T000      |                Clients (Mandants) Information                |       |       |       |
|     TSTC      |                     All SAP Transactions                     |       |       |       |
|    REPOSRC    |                      ABAP Sources Code                       |       |       |       |
|    RSECTAB    |                    Secure Storage Stores                     |       |       |       |
|     UST04     |            User Masters (All Users with Profiles)            |       |       |       |
|    UST10C     |               User Master: Composite Profiles                |       |       |       |
|    UST10S     |                 User Master: Simple Profiles                 |       |       |       |
|     UST12     |                 User Master: Authorizations                  |       |       |       |
|   AGR_1250    |                 Role and Authorization Data                  |       |       |       |
|  AGR_DEFINE   |              To See All Roles (Role Definition)              |       |       |       |
|     T012      |                         House Banks                          |       |       |       |
| T012A, T012B  |                  Allocation Payment Methods                  |       |       |       |
|     T012C     |                 Terms for Bank Transactions                  |       |       |       |
|     T012D     |     Parameters for DMEs and Foreign Payment Transactions     |       |       |       |
|     T012E     | DI-Compatible House Banks and Payment Methods Pooled Table and Data |       |       |       |
|     T012K     |                     House Bank Accounts                      |       |       |       |
|     T012O     |         Bank Accounts and Other Data Table and Data          |       |       |       |
|     BNKA      |                         Bank Master                          |       |       |       |
|     TIBAN     |           IBAN (International Bank Account Number)           |       |       |       |

## Metasploit modules

- auxiliary/scanner/sap/sap_service_discovery

- scanner/sap/sap_icm_urlscan
- scanner/sap/sap_router_info_request (3299)
- auxiliary/scanner/http/sap_businessobjects_user_enum (/dswsbobje/services/BICatalog?wsdl)



## Paywalled softwares

**SAP NWRFC SDK** **+ pyrfc**

- Spawn a container running Debian 12
- `apt intall python3 python3-pip python3-venv`
- `python -m venv pyrfc`
- `source pyrfc/bin/activate`
- `python -m pip install pandas pyrfc==3.1.0`
- unzip **nwrfc750P_10-70002752.zip**
- `export LD_LIBRARY_PATH=/root/nwrfcsdk/lib/`

```bash
python pyrfc_audit.py --host HOST --instance NN --client 100 --username '' --password ''
```







## References

### Repositories

https://github.com/Jean-Francois-C/SAP-Security-Audit/

https://github.com/gelim/nmap-sap

https://github.com/OWASP/pysap

https://github.com/shipcod3/mySapAdventures

https://github.com/damianStrojek/SAPPV

https://sap.github.io/PyRFC/install.html

https://github.com/SAP-archive/PyRFC

https://github.com/nitbx/sap-nw-abap-trial-docker

https://github.com/nitbx/powersap

### Articles

https://www.anvilsecure.com/blog/introducing-hanalyzer.html

https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-sap.html

https://help.sap.com/docs/SUPPORT_CONTENT/security/3362974401.html

https://onapsis.com/blog/

https://www.rapid7.com/blog/post/2014/01/09/piercing-saprouter-with-metasploit/

https://labs.withsecure.com/publications/run-sap-run

https://c22blog.wordpress.com/2011/12/11/seczone-2011-sap-insecurity-slides/

http://spl0it.org/files/talks/source_barcelona10/Hacking%20SAP%20BusinessObjects.pdf

https://i.blackhat.com/BH-US-23/Presentations/US-23-Genuer-chained-to-hit-discovering-new-vectors-to-gain-remote-and-root-access-in-sap-enterprise-software-wp.pdf?_gl=1

## Wordlists

https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/URLs/urls-SAP.txt

https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/CMS/SAP.fuzz.txt

https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/sap.txt

https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/sap-analytics-cloud.txt

https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/SAP-NetWeaver.txt

https://github.com/rapid7/metasploit-framework/blob/master/data/wordlists/sap_icm_paths.txt

https://github.com/rapid7/metasploit-framework/blob/master/data/wordlists/sap_default.txt



## Documentation

All SAP ports: https://help.sap.com/docs/Security/575a9f0e56f34c6e8138439eefc32b16/616a3c0b1cc748238de9c0341b15c63c.html

SAP Trials download: https://go.support.sap.com/minisap/#/minisap
