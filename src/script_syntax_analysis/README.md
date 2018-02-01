# ssa
Script Syntax Analyzer

# how to use?
static analysis
```
node.exe ssa.js input_file > output_file
```
dynamic analysis
```
node.exe ssa_eval.js input_file > output_file
```
svm analysis
```
python classify_training.py malicious_folder normal_folder js
python ssa_svm.py samples_folder js
```

# install npm packages
- esprima
Esprima can be used to perform lexical analysis (tokenization) or syntactic analysis (parsing) of a JavaScript program.

[https://www.npmjs.com/package/esprima](https://www.npmjs.com/package/esprima)

You could get more information from:

[http://esprima.readthedocs.io/en/3.1/getting-started.html](http://esprima.readthedocs.io/en/3.1/getting-started.html)

- escodegen
Escodegen (escodegen) is an ECMAScript (also popularly known as JavaScript) code generator from Mozilla's Parser API AST.

[https://www.npmjs.com/package/escodegen](https://www.npmjs.com/package/escodegen)


# unit test samples
usage：
.\run_ut.bat
You could find result in .\ut.log
You could find all of UT samples in follow path
```
./ut/samples
```
