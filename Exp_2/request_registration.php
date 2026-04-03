<?php

function validateUsername($name)
{
    if (strlen($name) > 200)
        return false;
    if (!preg_match("/^[a-zA-Z0-9 ]*$/", $name))
        return false;
    return true;
}


function generateGreeting($name, $hobby)
{
    if (!empty($hobby)) {
        return "Welcome, <strong>$name</strong>! It's fantastic that you enjoy $hobby. We hope this platform brings you joy!";
    } else {
        return "Welcome to the platform, <strong>$name</strong>! We're glad to have you on board.";
    }
}

$methodUsed = "REQUEST";
$errors = [];
$sanitizedData = [];
$greeting = "";

if (isset($_REQUEST["fullName"])) {


    $fullName = htmlspecialchars(trim($_REQUEST["fullName"] ?? ''));
    $email = htmlspecialchars(trim($_REQUEST["email"] ?? ''));
    $rationNumber = htmlspecialchars(trim($_REQUEST["rationNumber"] ?? ''));
    $familySize = htmlspecialchars(trim($_REQUEST["familySize"] ?? ''));
    $category = htmlspecialchars(trim($_REQUEST["category"] ?? ''));
    $hobby = htmlspecialchars(trim($_REQUEST["hobby"] ?? ''));
    $address = htmlspecialchars(trim($_REQUEST["address"] ?? ''));


    if (empty($fullName)) {
        $errors[] = "Full Name is mandatory.";
    } elseif (!validateUsername($fullName)) {
        $errors[] = "Full Name must not exceed 200 characters and contain only letters/numbers.";
    }

    if (empty($email)) {
        $errors[] = "Email is mandatory.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format.";
    }

    if (empty($rationNumber) || empty($familySize) || empty($category) || empty($address)) {
        $errors[] = "Please ensure all mandatory fields are filled out properly.";
    }

    if (empty($errors)) {
        $sanitizedData = [
            'Name' => $fullName,
            'Email' => $email,
            'Ration Card No.' => $rationNumber,
            'Family Size' => $familySize,
            'Category' => $category,
            'Hobby' => $hobby,
            'Address' => $address
        ];

        $greeting = generateGreeting($fullName, $hobby);
    }
} else {
    $errors[] = "No direct script access allowed. Please submit the form via GET or POST.";
}

?>

<!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>REQUEST Registration Result</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css" />
</head>

<body>



    <div class="container-card">
        <div class="header-section" style="margin-bottom: 1rem;">
            <h2>Processor Mode <span class="badge">$_REQUEST</span>
            </h2>
        </div>

        <?php if (!empty($errors)): ?>
            <div class="result-card" style="border-color: var(--error-color);">
                <h3 style="color: var(--error-color);">Validation Errors Found</h3>
                <ul style="color: var(--error-color); padding-left: 1.5rem; margin-top: 1rem;">
                    <?php foreach ($errors as $error): ?>
                        <li><?php echo $error; ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php else: ?>

            <?php if ($greeting): ?>
                <div class="greeting-banner">
                    <?php echo $greeting; ?>
                </div>
            <?php endif; ?>

            <div class="result-card">
                <h3>Submitted Beneficiary Summary</h3>
                <?php foreach ($sanitizedData as $label => $value): ?>
                    <div class="result-item">
                        <div class="result-label"><?php echo $label; ?>:</div>
                        <div class="result-value"><?php echo empty($value) ? '<em>N/A</em>' : $value; ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>

        <div style="text-align: center; margin-top: 2rem;">
            <a href="index.html" class="back-link">← Return to Registration Form</a>
        </div>
    </div>
</body>

</html>