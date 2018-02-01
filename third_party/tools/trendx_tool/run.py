import extractor
import numpy
import os
import xgboost as xgb
model1 = os.path.abspath(os.path.join(os.path.dirname(__file__), 'trendx.xgboost_model'))

class JSModel:

    def __init__(self):
        self.loadmodel()
        return 

    def loadmodel(self):
        self.model =  xgb.Booster()
        self.model.load_model(model1) 

    def predict_v(self,featurev):
        print featurev
        featurev = [float(x) for x in featurev.split(",")]
        dtest =xgb.DMatrix(featurev,missing=numpy.nan)
        predicted = self.model.predict(dtest)
        return predicted

    def predictfile(self,file_path):
        ex = extractor.extractor()
        featurev = ex.extract(file_path)
        return self.predict_v(featurev)

    def predict(self,buf):
        ex = extractor.extractor()
        featurev = ex.extractbuf(buf)
        predicted = self.predict_v(feautrev)
        return predicted
                 


if __name__ == '__main__':
    m = JSModel() 
    import sys
    print m.predictfile(sys.argv[1])[0]
