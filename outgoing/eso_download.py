"""
This script enables the user to download data from the ESO science archive.
If data is protected then authentication is required. Authentication can be skipped for public data.
Queries should be made assuming that the data is in order of MJD_OBS.

This makes use of the eso_programmatic.py file: an ESO python library defining methods to programmatically
access the ESO science archive with user inputs (version 0.4, 2024-10-22).
The following eso programmatic url page was exploited to make it user-friendly:
http://archive.eso.org/programmatic/HOWTO/jupyter/authentication_and_authorisation/programmatic_authentication_and_authorisation.html
"""

import requests
import json
import pyvo
from pyvo.dal import tap
from pyvo.auth.authsession import AuthSession
import cgi
import os
import sys
import re
import shutil
from tqdm import tqdm
import numpy as np                                                                   
import requests
import getpass
from astropy.io import fits
from datetime import datetime, timedelta
import importlib.metadata

pyvo_version = importlib.metadata.version('pyvo')
test_pyvo_version = (pyvo_version == '1.1' or pyvo_version > '1.2.1')
if not test_pyvo_version:
    print(f'You are using an unsupported version of pyvo (version={pyvo_version}).\n'
          'Please use pyvo v1.1, v1.3, or higher, not v1.2* [ref. pyvo github issue #298].')
    raise ImportError(f'The pyvo version you are using is not supported, use 1.3+ or 1.1.')
    print(f'\npyvo version {pyvo_version} \n')

TAP_URL = "http://archive.eso.org/tap_obs"
TOKEN_AUTHENTICATION_URL = "https://www.eso.org/sso/oidc/token"

def getToken(username, password):
    """Token based authentication to ESO: provide username and password to receive back a JSON Web Token."""
    if username==None or password==None:
        return None

    token = None
    try:
        response = requests.get(TOKEN_AUTHENTICATION_URL,
                            params={"response_type": "id_token token",
                                    "grant_type":    "password",
                                    "client_id":     "clientid",
                                    "username":      username,
                                    "password":      password})
        token_response = json.loads(response.content)
        token = token_response['id_token']
    except NameError as e:
        print(e)
    except:
        print("*** AUTHENTICATION ERROR: Invalid credentials provided for username %s" %(username))

    return token

def createSession():
    username = input("Type your ESO username: ")
    password = getpass.getpass(prompt="Type your ESO password: ", stream=None)

    token = getToken(username, password)

    session = requests.Session()
    if token:
        session.headers['Authorization'] = "Bearer " + token
    return session

def authenticate():
    while True:
        ans = input("\nDoes the data require authentication to download? [y/n]: ")
        if ans == 'y':
            session = createSession()
            break
        elif ans == 'n':
            session = None
            break
        else:
            print("Invalid input. Please enter 'y' or 'n'.")
    return session

def make_query():
    print('\nDefine your search criteria (by default in order of MJD_OBS)')
    prog_id = input("Program ID: ")
    obid_str = input("OBID (or press Enter to select all): ")
    obid = str(obid_str) if obid_str.isdigit() else None
    filter_str = input("Filter (or press Enter to select all): ")
    filter = str(filter_str) if filter_str.isdigit() else None
    category_input = input("Data category (or press Enter to select SCIENCE): ")
    category = str(category_input.upper()) if category_input.isdigit() else 'SCIENCE'
    top_n_input = input("Number of files to select (or press Enter to select all): ")
    top_n = int(top_n_input) if top_n_input.isdigit() else None

    query = f"select * from dbo.raw where dp_cat='{category}' and prog_id='{prog_id}'"
    if obid and top_n and filter: #obid and topn and filter
        query = f"select top {top_n} * from dbo.raw where dp_cat='{category}' and prog_id='{prog_id}' and ob_id='{obid}' and filter_path='{filter}'"
    if not obid and top_n and filter: #topn and filter
        query = f"select top {top_n} * from dbo.raw where dp_cat='{category}' and prog_id='{prog_id}' and filter_path='{filter}'"
    if obid and top_n and not filter: #obid and topn
        query = f"select top {top_n} * from dbo.raw where dp_cat='{category}' and prog_id='{prog_id}' and ob_id='{obid}'"
    if obid and not top_n and filter: #obid and filter
        query = f"select * from dbo.raw where dp_cat='{category}' and prog_id='{prog_id}' and ob_id='{obid}' and filter_path='{filter}'"
    if obid and not top_n and not filter: #obid
        query = f"select * from dbo.raw where dp_cat='{category}' and prog_id='{prog_id}' and ob_id='{obid}'"
    if not obid and top_n and not filter: #topn
        query = f"select top {top_n} * from dbo.raw where dp_cat='{category}' and prog_id='{prog_id}'"
    if not obid and not top_n and filter: #filter
        query = f"select * from dbo.raw where dp_cat='{category}' and prog_id='{prog_id}' and filter_path='{filter}'"

    return query

def want_assoc_files():
    while True: #ask until typing an acceptable answer
        i = input("Do you also want to download associated files? [y/n]: ").lower()
        if i == 'y':
            assoc = True
            while True:
                j = input("Mode of associated files (raw/processed/log): ").lower()
                if j == 'processed':
                    mode_requested = 'raw2master'
                    mode = 'calSelector_' + mode_requested
                    break
                elif j == 'log':
                    mode_requested = 'night_log'
                    mode = mode_requested
                    break
                elif j == 'raw':
                    mode_requested = 'raw2raw'
                    mode = 'calSelector_' + mode_requested
                    break
                else:
                    print("Invalid mode. Please enter 'raw', 'processed', or 'log'.")
            break
        elif i == 'n':
            assoc = False
            mode_requested = None
            mode = None
            break
        else:
            print("Invalid input. Please enter 'y' or 'n'.")

    return assoc, mode_requested, mode

def printTableTransposedByTheRecord(table):
    """Utility method to print a table transposed, one record at the time"""
    prompt='    '
    rec_sep='-' * 105
    print('=' * 115)
    for row in table:
        for col in row.columns:
            print("{0}{1: <14} = {2}".format(prompt, col, row[col]) )
        print("{0}{1}".format(prompt,rec_sep))

def run_job(query):
    results = None

    # Define a job that will run the query asynchronously
    job = tap.submit_job(query)

    # Extend maximum duration of job to 300s (default 60 seconds, max allowed 3600s)
    job.execution_duration = 300

    # Run job and wait until completion
    job.run()

    try:
        job.wait(phases=["COMPLETED", "ERROR", "ABORTED"], timeout=600.)
    except pyvo.DALServiceError:
        print('Exception on JOB {id}: {status}'.format(id=job.job_id, status=job.phase))

    # print("Job: %s %s" %(job.job_id, job.phase))

    if job.phase == 'COMPLETED':
        # When the job has completed, the results can be fetched:
        results = job.fetch_result()

    # The job can be deleted (always a good practice to release the disk space on the ESO servers)
    job.delete()

    # Print job results to examine content. Check out the access_url and the datalink_url
    if results:
        print("Query results:")
        printTableTransposedByTheRecord(results.to_table())
    else:
        print("!" * 42)
        print("!                                        !")
        print("!       No results could be found.       !")
        print("!       ? Perhaps no permissions ?       !")
        print("!       Aborting here.                   !")
        print("!                                        !")
        print("!" * 42)
        quit()

    return results

def downloadURL(file_url, dirname='.', filename=None, session=None):
    """Method to download a file, either anonymously (no session or session not "tokenized"), or authenticated (if session with token is provided).
       It returns: http status, and filepath on disk (if successful)"""

    if dirname != None:
        if not os.access(dirname, os.W_OK):
            print("ERROR: Provided directory (%s) is not writable" % (dirname))
            sys.exit(1)
      
    if session!=None:
        response = session.get(file_url, stream=True)
    else:
        # no session -> no authentication
        response = requests.get(file_url, stream=True)

    # If not provided, define the filename from the response header
    if filename == None:
        contentdisposition = response.headers.get('Content-Disposition')
        if contentdisposition != None:                                                                                                             
            value, params = cgi.parse_header(contentdisposition)
            filename = params["filename"]

        # if the response header does not provide a name, derive a name from the URL
        if filename == None:
            # last chance: get anything after the last '/'
            filename = file_url[file_url.rindex('/')+1:]

    # define the file path where the file is going to be stored
    if dirname == None:
        filepath = filename
    else:
        filepath = dirname + '/' + filename

    if response.status_code == 200:
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=50000):
                f.write(chunk)

    return (response.status_code, filepath)

def download_raw(results,download_dir,session=None):
    print("\nStarting raw download...")
    for raw in results:
        access_url = raw['access_url'] # the access_url is the link to the raw file
        status, filepath = downloadURL(access_url, session=session, dirname=download_dir)
        if status==200:
            print("      RAW: %s downloaded  "  % (filepath))
        else:
            print("ERROR RAW: %s NOT DOWNLOADED (http status:%d)"  % (filepath, status))

def calselectorInfo(description):
    """Parse the main calSelector description, and fetch: category, complete, certified, mode, and messages."""

    category=""
    complete=""
    certified=""
    mode=""
    messages=""

    m = re.search('category="([^"]+)"', description)
    if m:
        category=m.group(1)
    m = re.search('complete="([^"]+)"', description)
    if m:
        complete=m.group(1).lower()
    m = re.search('certified="([^"]+)"', description)
    if m:
        certified=m.group(1).lower()
    m = re.search('mode="([^"]+)"', description)
    if m:
        mode=m.group(1).lower()
    m = re.search('messages="([^"]+)"', description)
    if m:
        messages=m.group(1)

    return category, complete, certified, mode, messages

def printCalselectorInfo(description, mode_requested):
    """Print the most relevant params contained in the main calselector description."""

    category, complete, certified, mode_executed, messages = calselectorInfo(description)

    alert=""
    if complete!= "true":
        alert = "ALERT: incomplete calibration cascade"

    mode_warning=""
    if mode_executed != mode_requested:
        mode_warning = "WARNING: requested mode (%s) could not be executed" % (mode_requested)

    certified_warning=""
    if certified != "true":
        certified_warning = "WARNING: certified=\"%s\"" %(certified)

    print("    calibration info:")
    print("    ------------------------------------")
    print("    science category=%s" % (category))
    print("    cascade complete=%s" % (complete))
    print("    cascade messages=%s" % (messages))
    print("    cascade certified=%s" % (certified))
    print("    cascade executed mode=%s" % (mode_executed))
    print("    full description: %s" % (description))

    return alert, mode_warning, certified_warning

def download_assoc(results,mode_requested,mode,download_dir,session=None):
    if mode == 'processed':
        print('\nDownloading associated processed calibration files')
    elif mode  == 'log':
        print('\nDownloading associated Night Log report')
    else:
        print('\nDownloading associated raw calibration files')

    #Download associated files for each unique night (midday day1 to midday day2)
    processed_nights = set()
    for raw in results:
        exp_start = raw['exp_start']
        if '.' in exp_start:
            obs_time = datetime.strptime(exp_start, "%Y-%m-%dT%H:%M:%S.%fZ")
        else:
            obs_time = datetime.strptime(exp_start, "%Y-%m-%dT%H:%M:%SZ")
        midday = obs_time.replace(hour=12, minute=0, second=0, microsecond=0)
        if obs_time < midday:
            obs_night = midday - timedelta(days=1)
        else:
            obs_night = midday

        if obs_night not in processed_nights:

            datalink_url = raw['datalink_url']
            datalink = pyvo.dal.adhoc.DatalinkResults.from_result_url(datalink_url, session=session)
            printTableTransposedByTheRecord(datalink.to_table())

            #Provide a link to the associated calibration files
            semantics = 'http://archive.eso.org/rdf/datalink/eso#' + mode

            assoc_url = next(datalink.bysemantics( semantics )).access_url
            
            #Get list of files
            assoc_files = pyvo.dal.adhoc.DatalinkResults.from_result_url(assoc_url, session=session)

            # Create and use a mask to get only the #calibration entries (not #this or ...#sibling_raw centries)
            calibrator_mask = (assoc_files['semantics'] == '#calibration') & \
                    (assoc_files['eso_category'] != 'WAVE_BAND') & (assoc_files['eso_category'] != 'OH_SPEC') &\
                    (assoc_files['eso_category'] != 'ATMOS_MODEL') &  (assoc_files['eso_category'] != 'SOLAR_SPEC') &\
                    (assoc_files['eso_category'] != 'SPEC_TYPE_LOOKUP') &  (assoc_files['eso_category'] != 'ARC_LIST') &\
                    (assoc_files['eso_category'] != 'REF_LINES')
            calib_urls = assoc_files.to_table()[calibrator_mask]['access_url','eso_category']
            printTableTransposedByTheRecord(calib_urls)
            print('There are %d calib files to download'%len(calib_urls))

            this_description=next(assoc_files.bysemantics('#this')).description

            alert, mode_warning, certified_warning = printCalselectorInfo(this_description, mode_requested)

            if alert!="":
                print("%s" % (alert))
            if mode_warning!="":
                print("%s" % (mode_warning))
            if certified_warning!="":
                print("%s" % (certified_warning))
                
            # question = None
            # answer = None
            if len(calib_urls):
                # while answer != 'y' and answer != 'n':
                #     print()
                    # if alert or mode_warning or certified_warning:    
                    #     print("Given the above warning(s), do you still want to download these %d calib files [y/n]? "%(len(calib_urls))).lower()
                    # else:
                    #     print("No warnings reported, continuing to download these %d calib files"%(len(calib_urls)))

                i_calib=0
                for url,category in calib_urls:
                    i_calib+=1
                    status, filename = downloadURL(url, dirname=download_dir)
                    if status==200:
                        print("    CALIB: %4d/%d dp_id: %s (%s) downloaded"  % (i_calib, len(calib_urls), filename, category))
                    else:
                        print("    CALIB: %4d/%d dp_id: %s (%s) NOT DOWNLOADED (http status:%d)"  % (i_calib, len(calib_urls), filename, category, status))

            processed_nights.add(obs_night)

def get_valid_calibration_range(science_date):
    """Returns the valid calibration time range based on the observation time of the science file."""
    obs_time = datetime.strptime(science_date, "%Y-%m-%dT%H:%M:%S.%f")

    if obs_time.hour >= 12:  # Science file observed between 12 PM and 12 AM
        cal_start = obs_time.replace(hour=18, minute=0, second=0)
        cal_end = cal_start + timedelta(days=1)
    else:  # Science file observed between 12 AM and 12 PM
        cal_end = obs_time.replace(hour=18, minute=0, second=0)
        cal_start = cal_end - timedelta(days=1)

    return cal_start, cal_end

def move_file(src, dst_dir):
    """Moves a file to the destination directory. Handles filename conflicts by appending a counter."""
    if not os.path.exists(src):
        return

    filename = os.path.basename(src)
    dst = os.path.join(dst_dir, filename)

    if os.path.exists(dst):
        # If destination file exists, append a counter to the filename
        base, ext = os.path.splitext(filename)
        counter = 1
        while os.path.exists(dst):
            dst = os.path.join(dst_dir, f"{base}_{counter}{ext}")
            counter += 1

    try:
        shutil.move(src, dst)
    except FileNotFoundError as e:
        print(f"Error moving file {src}: {e}")

def want_tree():
    while True:
        tree = input("Do you want to automatically organise files into tree? [y/n]: ").lower()
        if tree == 'y':
            tree = True
            break
        elif tree == 'n':
            tree = False
            break
        print("Invalid input. Please enter 'y' or 'n'.")
    return tree

def make_tree(download_dir):

    print('\nDecompressing files')
    os.system(f'parallel uncompress ::: {download_dir}/*.Z')

    files = os.listdir(download_dir)
    sorted_files = sorted(files)

    # Separate lists to log science and calibration files
    science_files = []
    cal_files = []
    obids = []

    print("\nProcessing science files and associating calibration files (18:00d1-18:00d2)")
    for f in sorted_files:
        if 'fits' in f:
            fpath = os.path.join(download_dir, f)
            if not os.path.exists(fpath):                                                  
                print(f"Error: File {fpath} does not exist.")
                continue
            hdr = fits.open(fpath)[0].header
            date_str = hdr["DATE"]  # Observation timestamp in header
            obj = hdr["OBJECT"]
            if '.cat' in obj:  # Identify science files
                science_files.append(fpath)
                obid_str = str(hdr["HIERARCH ESO OBS ID"])
                obids.append(obid_str)            
            else:  # Identify calibration files
                cal_files.append(fpath)

    print('Found the following nights:')
    nights = []
    for fndx, f in enumerate(science_files):
        fpath = os.path.join(download_dir, f)
        hdr = fits.open(fpath)[0].header
        date_str = hdr["DATE"]
        obs_datetime = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%f") # Parse the timestamp
        obs_date = obs_datetime.strftime("%Y-%m-%d")

        # Determine the night directory
        if fndx == 0:
            if obs_datetime.hour < 18:
                # After midnight but before 18:00
                night_str = (obs_datetime - timedelta(days=1)).strftime("%Y-%m-%d")
            else:
                # Before midnight but after 18:00
                night_str = obs_date

        else:
            #If this is not first science obs of the OBID
            if obids[fndx] == obids[fndx-1] and \
                    datetime.strptime(obs_date, "%Y-%m-%d") == datetime.strptime(nights[fndx-1], "%Y-%m-%d") + timedelta(days=1):
                night_str = nights[fndx-1]
            else: #If this is first science obs of OBID
                if obs_datetime.hour < 18:
                    # After midnight but before 18:00
                    night_str = (obs_datetime - timedelta(days=1)).strftime("%Y-%m-%d")
                else:
                    # Before midnight but after 18:00
                    night_str = obs_date

        if night_str not in nights:
            print(night_str)
        nights.append(night_str)

        # Create directory structure for the science file and move it
        science_dir = os.path.join(download_dir, night_str, obids[fndx], 'science')
        os.makedirs(science_dir, exist_ok=True)
        shutil.move(fpath, science_dir)

    #Organise cal files
    for fndx, f in enumerate(cal_files):
        fpath = os.path.join(download_dir, f)
        hdr = fits.open(fpath)[0].header
        date_str = hdr["DATE"]
        obs_datetime = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S.%f") # Parse the timestamp
        obs_date = obs_datetime.strftime("%Y-%m-%d")

        # Determine the night directory
        if obs_datetime.hour < 18:
            # After midnight but before 18:00
            night_str = (obs_datetime - timedelta(days=1)).strftime("%Y-%m-%d")
        else:
            # Before midnight but after 18:00
            night_str = obs_date

        # Create directory structure for the cal file and move it
        cal_dir = os.path.join(download_dir, night_str, 'cal')
        os.makedirs(cal_dir, exist_ok=True)
        shutil.move(fpath, cal_dir)

    print("\nDone!")

if __name__ == "__main__":

    print()
    print('--------- ESO Science Archive data download ---------')
    print('This script is best setup to do the following:')
    print('Step 1 - Download SCIENCE files')
    print('Step 2 - Download associated calibration files')
    print('Step 3 - Organise into dates, science OBIDs and cals')
    print('-----------------------------------------------------')

    # Step 0: Authenticate if needed
    session = authenticate()

    # Step 1: Initialise a tap service for anonymous queries (you will not be able to find any file with protected metadata)
    tap = pyvo.dal.TAPService(TAP_URL, session=session)

    # Step 2: Make query using search criteria
    query = make_query()

    # Step 3: Ask to download associated files
    assoc, mode_requested, mode = want_assoc_files()

    # Step 4: Ask to sort files into tree
    tree = want_tree()

    # Step 5: Run job
    results = run_job(query)

    # Step 6: Download data
    download_dir = '.'
    download_raw(results,download_dir)

    # Step 7: Download associated files 
    if assoc:
        download_assoc(results,mode_requested,mode,download_dir)

    # Step 8: Sort files into tree
    if tree:
        make_tree(download_dir)
