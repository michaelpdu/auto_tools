import os, sys, csv
import urllib, bs4

def get_alexa_rank(URL):
    try:
        rank = bs4.BeautifulSoup(urllib.urlopen("http://data.alexa.com/data?cli=10&dat=s&url="+ URL).read(), "xml").find("REACH")['RANK']
        return int(rank)
    except Exception as e:
        return None

def check_url_in_csv(csv_file):
    with open(csv_file+'_new.csv', 'wb') as wh:
        spamwriter = csv.writer(wh, delimiter=' ', quoting=csv.QUOTE_MINIMAL)
        # spamwriter.writerow(['Spam', 'Lovely Spam', 'Wonderful Spam'])
        with open(csv_file, 'r') as rh:
            spamreader = csv.reader(rh, delimiter=',')
            for row in spamreader:
                # print("{} ==> {}".format(row[0], get_alexa_rank(row[0])))
                spamwriter.writerow([row[0], row[1] , row[2], get_alexa_rank(row[0])])

if __name__ == "__main__":
    check_url_in_csv(sys.argv[1])