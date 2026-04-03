<?php
require 'db.php';

$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$error = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['create'])) {
        $name = $_POST['name'];
        $email = $_POST['email'];
        $course = $_POST['course'];
        $grade = $_POST['grade'];

        $stmt = $conn->prepare("INSERT INTO students (name, email, course, grade) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $name, $email, $course, $grade);

        if ($stmt->execute()) {
            header("Location: index.php");
            exit();
        } else {
            $error = "Error: " . $stmt->error;
        }
        $stmt->close();
    } elseif (isset($_POST['update'])) {
        $id = $_POST['id'];
        $name = $_POST['name'];
        $email = $_POST['email'];
        $course = $_POST['course'];
        $grade = $_POST['grade'];

        $stmt = $conn->prepare("UPDATE students SET name=?, email=?, course=?, grade=? WHERE id=?");
        $stmt->bind_param("ssssi", $name, $email, $course, $grade, $id);

        if ($stmt->execute()) {
            header("Location: index.php");
            exit();
        } else {
            $error = "Error updating record: " . $stmt->error;
        }
        $stmt->close();
    }
}

// Handle deletion logic
if ($action == 'delete' && isset($_GET['id'])) {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM students WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        header("Location: index.php");
        exit();
    } else {
        $error = "Error deleting record: " . $stmt->error;
    }
    $stmt->close();
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Records (CRUD)</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h2>Student Records</h2>
        <?php if ($error) echo "<p style='color:red;'>$error</p>"; ?>

        <!-- CREATE FORM -->
        <?php if ($action == 'create'): ?>
            <h3>Add New Student</h3>
            <form method="post" action="index.php">
                <div class="form-group">
                    <label>Name:</label>
                    <input type="text" name="name" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" required>
                </div>
                <div class="form-group">
                    <label>Course:</label>
                    <input type="text" name="course" required>
                </div>
                <div class="form-group">
                    <label>Grade:</label>
                    <input type="text" name="grade" required maxlength="2">
                </div>
                <button type="submit" name="create" class="btn">Save</button>
                <a href="index.php" class="btn btn-delete">Cancel</a>
            </form>

        <!-- UPDATE FORM -->
        <?php elseif ($action == 'edit' && isset($_GET['id'])): ?>
            <?php
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT * FROM students WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $student = $result->fetch_assoc();
            $stmt->close();
            
            if (!$student) die("Student not found!");
            ?>
            <h3>Update Student</h3>
            <form method="post" action="index.php">
                <input type="hidden" name="id" value="<?php echo $student['id']; ?>">
                <div class="form-group">
                    <label>Name:</label>
                    <input type="text" name="name" value="<?php echo htmlspecialchars($student['name']); ?>" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" name="email" value="<?php echo htmlspecialchars($student['email']); ?>" required>
                </div>
                <div class="form-group">
                    <label>Course:</label>
                    <input type="text" name="course" value="<?php echo htmlspecialchars($student['course']); ?>" required>
                </div>
                <div class="form-group">
                    <label>Grade:</label>
                    <input type="text" name="grade" value="<?php echo htmlspecialchars($student['grade']); ?>" required maxlength="2">
                </div>
                <button type="submit" name="update" class="btn btn-edit">Update</button>
                <a href="index.php" class="btn btn-delete">Cancel</a>
            </form>

        <!-- DATA LISTING -->
        <?php else: ?>
            <a href="index.php?action=create" class="btn">Add New Student</a>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Course</th>
                    <th>Grade</th>
                    <th>Actions</th>
                </tr>
                <?php
                $sql = "SELECT * FROM students ORDER BY id DESC";
                $result = $conn->query($sql);
                if ($result && $result->num_rows > 0): 
                    while($row = $result->fetch_assoc()): ?>
                    <tr>
                        <td><?php echo $row['id']; ?></td>
                        <td><?php echo htmlspecialchars($row['name']); ?></td>
                        <td><?php echo htmlspecialchars($row['email']); ?></td>
                        <td><?php echo htmlspecialchars($row['course']); ?></td>
                        <td><?php echo htmlspecialchars($row['grade']); ?></td>
                        <td>
                            <a href="index.php?action=edit&id=<?php echo $row['id']; ?>" class="btn btn-edit">Edit</a>
                            <a href="index.php?action=delete&id=<?php echo $row['id']; ?>" class="btn btn-delete" onclick="return confirm('Are you sure you want to delete this record?');">Delete</a>
                        </td>
                    </tr>
                    <?php endwhile; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="6">No students found.</td>
                    </tr>
                <?php endif; ?>
            </table>
        <?php endif; ?>
    </div>
</body>
</html>
