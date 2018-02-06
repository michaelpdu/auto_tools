:::::::::::::::::::::SAL:::::::::::::::::::::
::python prepare-pattern.py --project sal_ti6 --version 102503.0.0
::pause

::python prepare-pattern.py --project sal_ti7 --version 110404.0.0
::pause

::python prepare-pattern.py --project sal_sandcastle --version 110010.0.0
::pause

::python prepare-pattern.py --project sal_production --version 102706
::pause

::python prepare-pattern.py --project sal_staging --version 103799
::pause

python prepare-pattern.py --project sal_unipattern --version 121213.0.0
pause

::python prepare-pattern.py --project sal_ti8 --version 115609.0.0
::pause

::python prepare-pattern.py --project sal_osce11_sp1 --version 2.5.2350
::pause

::python prepare-pattern.py --project sal_hc --version 110207
::pause

::python prepare-pattern.py --project sal_ddei --version 117311
::pause

::python prepare-pattern.py --project sal_ddei --version 199999
::pause

::python prepare-pattern.py --project sal_iws --version 199999
::pause

:::::::::::::::::::::BEP:::::::::::::::::::::
::python prepare-pattern.py --project bep_ti6 --version 1455
::pause

::python prepare-pattern.py --project bep_ti7 --version 100204.0.0
::pause

::python prepare-pattern.py --project bep_ti8 --version 102009.0.0
::pause

::python prepare-pattern.py --project bep_ti9 --version 102512.0.0
::pause

::in fact, this is for OSCE with BES 6.0
::python prepare-pattern.py --project bep_ti9 --version 7.5.1548
::pause

::python prepare-pattern.py --project bep_sandcastle --version 101910.0.0
::pause